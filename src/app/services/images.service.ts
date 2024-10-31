import { Injectable } from '@angular/core';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { environmentStorage } from '../environments/environmentStorage';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  private s3Client: S3Client;
  private bucketName = environmentStorage.bucketName; // Tu bucket de Spaces
  private region = environmentStorage.region; // Región de tu Space

  constructor() {
    this.s3Client = new S3Client({
      region: this.region,
      endpoint: 'https://nyc3.digitaloceanspaces.com', // Endpoint de tu espacio
      credentials: {
        accessKeyId: environmentStorage.accessKeyId, // Tu Access Key
        secretAccessKey: environmentStorage.secretAccessKey // Tu Secret Key
      }
    });
  }

  async uploadImage(file: File): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: file.name,
      Body: file,
      ACL: 'public-read', // Ajusta según necesites
    });

    try {
      await this.s3Client.send(command);
      return `https://${this.bucketName}.nyc3.digitaloceanspaces.com/${file.name}`; // URL del archivo subido
    } catch (err) {
      console.error('Error al subir la imagen', err);
      const error = err as Error;
      throw new Error(`Error al subir la imagen: ${error.message}`);
    }
  }
}