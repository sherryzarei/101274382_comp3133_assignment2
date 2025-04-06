import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSearchResultComponent } from './search.component';

describe('EmployeeSearchResultComponent', () => {
  let component: EmployeeSearchResultComponent;
  let fixture: ComponentFixture<EmployeeSearchResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeSearchResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
