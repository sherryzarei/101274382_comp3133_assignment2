import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, NativeDateAdapter, provideNativeDateAdapter } from '@angular/material/core'; // Import DateAdapter and NativeDateAdapter
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

interface Employee {
  _id?: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  designation: string;
  salary: number;
  date_of_joining: string;
  department: string;
  employee_photo: string;
}

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  providers: [provideNativeDateAdapter()], // Add this line
  templateUrl: './employeeform.component.html',
  styleUrls: ['./employeeform.component.css'],
})
export class EmployeeFormComponent implements OnInit {
  @Input() employee: Employee | null = null;
  @Output() formSubmitted = new EventEmitter<void>();
  employeeForm: FormGroup;
  genders = ['Male', 'Female', 'Other'];

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { employee?: Employee },
    public dialogRef: MatDialogRef<EmployeeFormComponent>
  ) {
    this.employeeForm = this.fb.group({
      _id: [''],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      designation: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(0)]],
      date_of_joining: ['', Validators.required],
      department: ['', Validators.required],
      employee_photo: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const employeeToEdit = this.data?.employee || this.employee;
    if (employeeToEdit) {
      this.employeeForm.patchValue({
        ...employeeToEdit,
        date_of_joining: new Date(employeeToEdit.date_of_joining),
      });
    }
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const rawData = this.employeeForm.value;
      const employeeData = {
        first_name: rawData.first_name,
        last_name: rawData.last_name,
        email: rawData.email,
        gender: rawData.gender,
        designation: rawData.designation,
        salary: parseFloat(rawData.salary),
        date_of_joining: new Date(rawData.date_of_joining).toISOString(),
        department: rawData.department,
        employee_photo: rawData.employee_photo,
        // Omit _id unless updating
        ...(rawData._id ? { _id: rawData._id } : {}),
      };

      const mutation = employeeData._id
        ? gql`
            mutation UpdateEmployee(
              $_id: ID!
              $first_name: String
              $last_name: String
              $email: String
              $gender: String
              $designation: String
              $salary: Float
              $date_of_joining: Date
              $department: String
              $employee_photo: String
            ) {
              updateEmployee(
                _id: $_id
                first_name: $first_name
                last_name: $last_name
                email: $email
                gender: $gender
                designation: $designation
                salary: $salary
                date_of_joining: $date_of_joining
                department: $department
                employee_photo: $employee_photo
              ) {
                _id
                first_name
                last_name
                email
                gender
                designation
                salary
                date_of_joining
                department
                employee_photo
              }
            }
          `
        : gql`
            mutation AddEmployee($input: EmployeeInput!) {
              addEmployee(input: $input) {
                _id
                first_name
                last_name
                email
                gender
                designation
                salary
                date_of_joining
                department
                employee_photo
              }
            }
          `;

      console.log('Sending GraphQL Request:', {
        mutation: mutation.loc?.source.body,
        variables: employeeData._id ? employeeData : { input: employeeData },
      });

      this.apollo
        .mutate({
          mutation,
          variables: employeeData._id ? employeeData : { input: employeeData },
        })
        .subscribe({
          next: (result) => {
            this.snackBar.open(
              employeeData._id ? 'Employee updated successfully!' : 'Employee added successfully!',
              'Close',
              { duration: 3000 }
            );
            this.formSubmitted.emit();
            if (!employeeData._id) this.employeeForm.reset();
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('GraphQL Error Details:', {
              message: error.message,
              networkError: error.networkError,
              graphQLErrors: error.graphQLErrors,
              extraInfo: error.extraInfo,
            });
            this.snackBar.open('Error: ' + error.message, 'Close', { duration: 5000 });
          },
        });
    } else {
      this.snackBar.open('Please fill all required fields correctly', 'Close', { duration: 5000 });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  previewUrl: string | ArrayBuffer | null = null;

onPhotoUpload(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
      this.employeeForm.patchValue({ employee_photo: reader.result });
    };
    reader.readAsDataURL(file); // Converts file to base64
  }
}

}