import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RmsTableComponent } from './rms-table.component';

describe('RmsTableComponent', () => {
  let component: RmsTableComponent;
  let fixture: ComponentFixture<RmsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RmsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RmsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
