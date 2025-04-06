import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

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
  selector: 'app-empDetail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule],
  templateUrl: './empDetail.component.html',
  styleUrls: ['./empDetail.component.css'],
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  employeeId: string | null = null;

  constructor(private route: ActivatedRoute, private apollo: Apollo) {}

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.fetchEmployee();
    }
  }

  fetchEmployee(): void {
    this.apollo
      .query<{ getEmployee: Employee }>({
        query: gql`
          query GetEmployee($id: ID!) {
            getEmployee(_id: $id) {
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
        variables: { id: this.employeeId },
      })
      .subscribe({
        next: (result) => {
          this.employee = result.data.getEmployee;
        },
        error: (error) => {
          console.error('Error fetching employee:', error);
        },
      });
  }
}
