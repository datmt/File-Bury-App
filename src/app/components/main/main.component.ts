import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Appwrite, Query } from 'appwrite';
import { Server } from '../../utils/config';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  buryForm: FormGroup;
  unEarthForm: FormGroup;
  createAnother = false;
  unearthCode = '';
  digAnother = false;
  secretText = '';

  appwrite: Appwrite;
  db: any;
  constructor(private formBuilder: FormBuilder) {
    this.buryForm = this.formBuilder.group({
      text: ['', [Validators.required]],
    });

    this.unEarthForm = this.formBuilder.group({
      code: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.appwrite = new Appwrite();
    this.appwrite
      .setEndpoint(Server.endpoint)
      .setProject(Server.project)
      .setLocale('en-US');

    this.login();
  }

  private async login() {
    if (!this.appwrite.account.get)
      await this.appwrite.account.createAnonymousSession();
  }

  handleDig() {
    const code = this.unEarthForm.value.code;
    this.digText(code).then((data: any) => {
      console.log('data is, ', data);
      this.secretText = data.documents[0].text;
      this.digAnother = true;
      this.unEarthForm.reset();
    });
  }

  async digText(code: string) {
    return await this.appwrite.database.listDocuments(Server.collectionID, [
      Query.equal('code', [parseInt(code)]),
    ]);
  }

  handleBury() {
    this.buryText(this.buryForm.value.text).then((data: any) => {
      this.createAnother = true;
      this.unearthCode = data.code;
      this.buryForm.reset();
    });
  }

  async buryText(text: string) {
    const session = await this.appwrite.account.get();
    return this.appwrite.database.createDocument(
      Server.collectionID,
      'unique()',
      {
        code: Math.round(Math.random() * 1000000),
        text: text,
      }
    );
  }

  handleForm() {
    // let payload = {
    //   email: this.createTextForm.value.email,
    //   password: this.createTextForm.value.password,
    // };
  }
}
