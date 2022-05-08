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

  appwriteInstance: Appwrite;
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
    this.appwriteInstance = new Appwrite();
    console.log('start....0');

    this.appwriteInstance
      .setEndpoint(Server.apiEndpoint)
      .setProject(Server.project)
      .setLocale('en-US');

    console.log('start....1');

    this.login();
  }

  private async login() {
    console.log('start....3');
    try {
      const currentAccount = await this.appwriteInstance.account.getSessions();
    } catch (e) {
      console.log('error', e);
      await this.appwriteInstance.account.createAnonymousSession();
    }


  }

  handleDig() {
    const code = this.unEarthForm.value.code;
    this.digText(code).then((data: any) => {
      data = JSON.parse(data.message);
      this.secretText = data.documents[0].text;
      this.digAnother = true;
      this.unEarthForm.reset();
    });
  }

  async digText(code: string) {
    return await this.appwriteInstance.database.listDocuments(Server.collectionID, [
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
    const session = await this.appwriteInstance.account.get();
    return this.appwriteInstance.database.createDocument(
      Server.collectionID,
      'unique()',
      {
        code: '__CODE_PLACEHOLDER__',
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
