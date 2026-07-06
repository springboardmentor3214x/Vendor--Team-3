import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsScreenComponent } from './notifications-screen.component';

describe('NotificationsScreenComponent', () => {
  let component: NotificationsScreenComponent;
  let fixture: ComponentFixture<NotificationsScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
