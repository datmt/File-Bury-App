import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Appwrite, AppwriteException, Query} from 'appwrite';
import { Server } from '../../utils/config';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';

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
  isText = true;

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

  public files: NgxFileDropEntry[] = [];

  private upload(file: File, fileId: string) {
    let promise = this.appwriteInstance
    
    .storage
    
    .createFile(Server.bucketId,fileId,   file)
    .then(data => {
      console.log('data ok', data);
    })
    .catch(err => {
      console.log('error', err);
    })

  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          // Here you can access the real file
          console.log(droppedFile.relativePath, file);
          this.upload(file, 'file' + Math.round(Math.random() * 100000));

          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  public fileOver(event: any){
    console.log(event);
  }

  public fileLeave(event: any){
    console.log(event);
  }

  ngOnInit(): void {
    console.log('start....');
    this.appwriteInstance = new Appwrite();
    console.log('start....0');

    this.appwriteInstance
      .setEndpoint(Server.endpoint)
      .setProject(Server.project)
      .setLocale('en-US');


    this.login();
  }

  private async login() {
    console.log('start....3');
    try {
      const currentAccount = await this.appwriteInstance.account.getSessions();
      console.log('current account', currentAccount);
      // @ts-ignore
      if (currentAccount?.message) {
        // @ts-ignore
        if (JSON.parse(currentAccount.message)?.code === 401) {
          throw new Error('Invalid session');
        }
      }
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
        text,
        timestamp: '__TS_PLACEHOLDER__',
        is_text: true
      }
    );
  }
}
