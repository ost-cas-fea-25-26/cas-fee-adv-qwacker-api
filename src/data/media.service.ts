import { Bucket, Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly storage: Storage;
  private readonly bucket: Bucket;

  constructor(config: ConfigService) {
    this.storage = new Storage();
    this.bucket = this.storage.bucket(config.getOrThrow('STORAGE_BUCKET_NAME'));
  }

  /**
   * Upload a file (via buffer) to the storage bucket and return the public URL.
   */
  async upload(buffer: Buffer, mimeType: string) {
    const file = this.bucket.file(v4());
    await file.save(buffer, { contentType: mimeType });
    return file.publicUrl();
  }
}
