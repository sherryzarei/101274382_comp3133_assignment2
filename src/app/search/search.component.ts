import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeFormComponent } from '../components/emp/employeeform/employeeform.component';

interface Employee {
  _id: string;
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
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class EmployeeSearchResultComponent implements OnInit {
  displayedColumns: string[] = [
    'employee_photo',
    'first_name',
    'last_name',
    'email',
    'gender',
    'designation',
    'salary',
    'date_of_joining',
    'department',
    'actions',
  ];
  dataSource: Employee[] = [];
  currentDesignation: string | null = null;
  currentDepartment: string | null = null;

  @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;
  private deleteTargetId: string = '';

  constructor(
    private route: ActivatedRoute,
    private apollo: Apollo,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.currentDesignation = params['designation'] || null;
      this.currentDepartment = params['department'] || null;
      if (!this.currentDesignation && !this.currentDepartment) {
        this.dataSource = [];
        this.snackBar.open('No search criteria provided', 'Close', { duration: 3000 });
        return;
      }
      this.fetchSearchResults(this.currentDesignation, this.currentDepartment);
    });
  }

  fetchSearchResults(designation: string | null, department: string | null): void {
    this.apollo
      .query<{ getEmployeeByDesignationOrDepartment: Employee[] }>({
        query: gql`
          query GetEmployeesByDesignationOrDepartment($designation: String, $department: String) {
            getEmployeeByDesignationOrDepartment(designation: $designation, department: $department) {
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
        `,
        variables: { designation, department },
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: (result) => {
          this.dataSource = [...result.data.getEmployeeByDesignationOrDepartment];
        },
        error: (error) => {
          this.snackBar.open('Error fetching search results: ' + error.message, 'Close', { duration: 5000 });
          this.dataSource = [];
        },
      });
  }

  viewEmployee(employee: Employee): void {
    this.router.navigate(['/employee/view', employee._id]);
  }

  editEmployee(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeFormComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { employee },
    });

    dialogRef.componentInstance.formSubmitted.subscribe(() => {
      this.fetchSearchResults(this.currentDesignation, this.currentDepartment);
      dialogRef.close();
    });
  }

  deleteEmployee(_id: string): void {
    this.deleteTargetId = _id;
    const dialogRef = this.dialog.open(this.deleteDialog, { width: '400px' });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.apollo
          .mutate({
            mutation: gql`
              mutation DeleteEmployee($_id: ID!) {
                deleteEmployee(_id: $_id) {
                  _id
                }
              }
            `,
            variables: { _id },
            refetchQueries: [
              {
                query: gql`
                  query GetEmployeesByDesignationOrDepartment($designation: String, $department: String) {
                    getEmployeeByDesignationOrDepartment(designation: $designation, department: $department) {
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
                `,
                variables: {
                  designation: this.currentDesignation,
                  department: this.currentDepartment,
                },
              },
            ],
          })
          .subscribe({
            next: () => {
              this.snackBar.open('Employee deleted successfully!', 'Close', { duration: 3000 });
              this.fetchSearchResults(this.currentDesignation, this.currentDepartment);
            },
            error: (error) => {
              this.snackBar.open('Error deleting employee: ' + error.message, 'Close', { duration: 5000 });
            },
          });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }
}
