import { FFmpeg as FFmpegCore } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { ReversedFileMimeType } from "./FileMemeType";

async function debug_URL(s:string,_:string){return s}
class ffmpegCls {
  private ffmpeg: FFmpegCore;
  private loaded: boolean;
  on: Function;

  constructor() {
    this.ffmpeg = new FFmpegCore();
    this.loaded = false;
    this.on = this.ffmpeg.on.bind(this.ffmpeg)
  }

  /**
   * Load the FFmpeg library.
   */
  async load(): Promise<void> {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.2/dist/umd";

    this.ffmpeg.on("log", ({ message }:any) => { // TODO : proper logging setup in app.tsx
      console.log(message);
    });
      // toBlobURL is used to bypass CORS issue, urls with the same
      // domain can be used directly.

    await this.ffmpeg.load({
      coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript",
      ),
      wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm",
      ),
      workerURL:await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,"text/javascript"
      ),
      //thread:false // for now, without threds.
  });
  this.loaded = true;

  }

  /**
   * Execute an FFmpeg command and return the output as a Blob URL.
   * @param inputFile - Input file path or URL.
   * @param args - Array of FFmpeg arguments.
   * @returns Blob URL of the output.
   */
  async exec(inputFileName:string,inputFileType:string,inputBlob: string,outputFile:string, args: string[],finish_callback:Function): Promise<Blob> {
    if (!this.loaded) {
      throw new Error("FFmpeg not loaded yet. Call the 'load' method.");
    }

    await this.ffmpeg.writeFile(inputFileName, await fetchFile(inputBlob));
    await this.ffmpeg.exec(["-i", inputFileName, ...args, outputFile]);

    const data = await this.ffmpeg.readFile(outputFile);
    const fileext = outputFile.split(".").pop()||"mp4"
    const mimetype = ReversedFileMimeType[fileext as keyof typeof ReversedFileMimeType] // ||inputFileType
    const blob = new Blob([data],{type:mimetype});
    finish_callback();
    return blob
    // debugger;

    // return URL.createObjectURL(blob);
  }
}

export default ffmpegCls;
