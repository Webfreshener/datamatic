import {Component} from '@angular/core';
import * as datamatic from "datamatic";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'webapp-ng';
  protected tx: any;
  protected data = [];

  ngOnInit() {
    this.tx = new datamatic.Pipeline({
      type: "array",
      items: {
        type: "string",
      }
    });

    this.tx.subscribe(data => console.log(this.data = data));
    this.tx.write(["a", "b", "c"]);
  }
}
