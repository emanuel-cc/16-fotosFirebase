import { Injectable } from '@angular/core';
import { snapshotChanges } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

// import * as firebase from 'firebase';
import { FileItem } from '../models/file-item';
import { environment } from '../../environments/environment';

import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

firebase.initializeApp(environment.firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {
  private CARPETA_IMAGENES = 'imgs';

  constructor(private db:AngularFirestore) { }

  cargarImagenesFirebase(imagenes:FileItem[]){
    // console.log(imagenes);
    const storageRef = firebase.storage().ref();
    for(const item of imagenes){
      item.estaSubiendo = true;
      if(item.progreso >= 100){
        continue;
      }
      // firebase.storage.UploadTask
      const uploadTask:firebase.storage.UploadTask = storageRef.child(`${this.CARPETA_IMAGENES}/${item.nombreArchivo}`)
                                                              .put(item.archivo);
      //Se ejecuta la tarea
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot:firebase.storage.UploadTaskSnapshot)=>item.progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        (error) => console.error("Error al subir ", error),
        async()=>{
          console.log("Imagen cargada correctamente");
          item.url = await uploadTask.snapshot.ref.getDownloadURL();
          item.estaSubiendo = false;
          this.guardarImagen({
            nombre: item.nombreArchivo,
            url: item.url
          });
        }
      );
    }
  }

  private guardarImagen(imagen:{nombre:string, url:string}){
    this.db.collection(`/${this.CARPETA_IMAGENES}`)
      .add(imagen);
  }
}
