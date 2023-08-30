import { FFmpeg as FFmpegCore } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
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
      // the documention say "toBlobURL is used to bypass CORS issue, urls with the same
      // domain can be used directly.", but ffmpeg.wasm crash without toBlobURL for some reason

    await this.ffmpeg.load({
      coreURL: await toBlobURL(
          `/js/ffmpeg-core.js`,
          "text/javascript",
      ),
      wasmURL: await toBlobURL(
        `/js/ffmpeg-core.wasm`,
        "application/wasm",
    ),
      workerURL:await toBlobURL(
        `/js/ffmpeg-core.worker.js`,"text/javascript"
      ),
  });
  this.loaded = true;

  }

  /**
   * Execute an FFmpeg command and return the output as a File with Blob URL.
   * @param inputFile - Input file path or URL.
   * @param args - Array of FFmpeg arguments.
   * @returns a file with Blob URL of the output.
   */
  async exec(inputFileName:string,OutputMimeType:string,inputBlob: string,outputFile:string, args: string[]): Promise<File> {
    if (!this.loaded) {
      throw new Error("FFmpeg not loaded yet. Call the 'load' method.");
    }

    await this.ffmpeg.writeFile(inputFileName, await fetchFile(inputBlob));

    const commandList = ["-hide_banner","-i", inputFileName, ...args, outputFile].filter(el=>(el!=='')) // remove empty strings
    console.log(`running ffmpeg command [${commandList}]`)
    await this.ffmpeg.exec(commandList);

    const data = await this.ffmpeg.readFile(outputFile);
    const blob = new Blob([data],{type:OutputMimeType});
    return new File([blob],outputFile,{type:OutputMimeType})
    }
}

export default ffmpegCls;
