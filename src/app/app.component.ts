import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {Actions, Select, Store} from '@ngxs/store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'file-route';

  constructor(private actions: Actions, private store: Store, private router: Router) {

  }
}
