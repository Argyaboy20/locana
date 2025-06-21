import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacypolicyPage } from './privacypolicy.page';

describe('PrivacypolicyPage', () => {
  let component: PrivacypolicyPage;
  let fixture: ComponentFixture<PrivacypolicyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacypolicyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
