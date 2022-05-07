import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { TodoComponent } from './components/todo/todo.component';
import { AuthGuard } from './helpers/auth-guard.guard';
import { MainComponent } from './components/main/main.component';

const routes: Routes = [{ path: '', component: MainComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
