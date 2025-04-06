import { Routes } from '@angular/router';
import { LoginComponent } from './components/user/login/login.component';
import { SignupComponent } from './components/user/signup/signup.component';
import { EmployeeComponent } from './components/emp/employees/employees.component';
import { EmployeeFormComponent } from './components/emp/employeeform/employeeform.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth.guard';
import { EmployeeDetailComponent } from './empDetail/empDetail.component';
import { EmployeeSearchResultComponent } from './search/search.component';


export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'login', component: LoginComponent, pathMatch: 'full' },
    { path: 'signup', component: SignupComponent, pathMatch: 'full' },
    { path: 'employees', component: EmployeeComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: 'employee/add', component: EmployeeFormComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: 'employee/edit/:id', component: EmployeeFormComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: 'employee/view/:id', component: EmployeeDetailComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: 'employees/searchResult', component: EmployeeSearchResultComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];