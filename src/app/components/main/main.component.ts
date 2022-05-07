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

  realAppWrite: Appwrite;
  pseudoAppWrite: Appwrite;
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
    console.log('start....');
    this.realAppWrite = new Appwrite();
    console.log('start....0');

    this.realAppWrite
      .setEndpoint(Server.endpoint)
      .setProject(Server.project)
      .setLocale('en-US');
    this.pseudoAppWrite = new Appwrite();
    this.pseudoAppWrite.setEndpoint(Server.apiEndpoint)
      .setProject(Server.project)
      .setLocale('en-US');

    console.log('start....1');

    this.login();
  }

  private async login() {
    console.log('start....3');

    const currentAccount = await this.realAppWrite.account.getSessions();
    console.log('account is', currentAccount);
    if (!currentAccount ) {
      console.log('need to login');
      await this.realAppWrite.account.createAnonymousSession();
    }
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
    return await this.realAppWrite.database.listDocuments(Server.collectionID, [
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
    const session = await this.realAppWrite.account.get();
    return this.pseudoAppWrite.database.createDocument(
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
