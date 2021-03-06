import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Appwrite, Query} from 'appwrite';
import {Server} from '../../utils/config';
import {FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry} from 'ngx-file-drop';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  buryForm: FormGroup;
  unEarthForm: FormGroup;
  digFileForm: FormGroup;
  createAnother = false;
  createAnotherFile = false;
  unearthCode = '';
  unearthFileCode = '';
  digAnother = false;
  digAnotherFile = false;
  secretText = '';
  isText = true;
  isLoading = false;

  appwriteInstance: Appwrite;
  db: any;

  constructor(private formBuilder: FormBuilder) {
    this.buryForm = this.formBuilder.group({
      text: ['', [Validators.required]],
    });

    this.unEarthForm = this.formBuilder.group({
      code: ['', [Validators.required]],
    });


    this.digFileForm = this.formBuilder.group({
      imageCode: ['', [Validators.required]],
    });
  }

  public files: NgxFileDropEntry[] = [];

  private upload(file: File) {
    this.isLoading = true;
    let promise = this.appwriteInstance
      .storage

      .createFile(Server.bucketId, this.uuidv4(), file)
      .then(data => {

        this.buryFile(data.$id)
          .then((fileData: any) => {
            this.unearthFileCode = fileData.code;
            this.createAnotherFile = true;
            this.isLoading = false;

          });

      })
      .catch(err => {
        console.log('error', err);
      });

  }

  public dropped(files: NgxFileDropEntry[]) {
    if (files.length > 1) {
      alert('1 file only!');
      return;
    }
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.upload(file);

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    }
  }

  public fileOver(event: any) {

  }

  public fileLeave(event: any) {

  }

  ngOnInit(): void {
    this.appwriteInstance = new Appwrite();

    this.appwriteInstance
      .setEndpoint(Server.endpoint)
      .setProject(Server.project)
      .setLocale('en-US');


    this.login();
  }

  private async login() {
    try {
      const currentAccount = await this.appwriteInstance.account.getSessions();
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
    this.isLoading = true;
    const code = this.unEarthForm.value.code;
    this.digText(code).then((data: any) => {
      data = JSON.parse(data.message);
      this.secretText = data.documents[0].text;
      this.digAnother = true;
      this.unEarthForm.reset();
      this.isLoading = false;
    });
  }

  handleDigFile() {
    const code = this.digFileForm.value.imageCode;
    this.isLoading = true;

    this.digText(code).then((data: any) => {
      data = JSON.parse(data.message);
      const fileId = data.documents[0].file_id;
      this.digFileForm.reset();
      const result = this.appwriteInstance.storage.getFileDownload(Server.bucketId, fileId);
      this.isLoading = false;
      if (result && result.href) {
        window.open(result.href, '_blank');
      } else {
        alert('file does not exist');
      }
    });


  }

  async digText(code: string) {
    return await this.appwriteInstance.database.listDocuments(Server.collectionID, [
      Query.equal('code', [parseInt(code)]),
    ]);
  }

  handleBury() {
    this.isLoading = true;
    this.buryText(this.buryForm.value.text).then((data: any) => {
      this.createAnother = true;
      this.unearthCode = data.code;
      this.buryForm.reset();
      this.isLoading = false;
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

  async buryFile(file_id: string) {
    const session = await this.appwriteInstance.account.get();
    return this.appwriteInstance.database.createDocument(
      Server.collectionID,
      'unique()',
      {
        code: '__CODE_PLACEHOLDER__',
        text: '',
        timestamp: '__TS_PLACEHOLDER__',
        is_text: false,
        file_id
      }
    );
  }

  private uuidv4(): string {

    // @ts-ignore
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      // tslint:disable-next-line:no-bitwise
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }
}
