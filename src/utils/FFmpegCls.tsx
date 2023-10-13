import { FFmpeg as FFmpegCore } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
class ffmpegCls {
  private ffmpeg: FFmpegCore;
  private loaded: boolean;
  on: Function;
  off:Function;

  constructor() {
    this.ffmpeg = new FFmpegCore();
    this.loaded = false;
    this.on = this.ffmpeg.on.bind(this.ffmpeg)
    this.off = this.ffmpeg.off.bind(this.ffmpeg)
  }

  /**
   * Load the FFmpeg library.
   */
  async load(): Promise<void> {
    let is_firefox = navigator.userAgent.toLowerCase().includes('firefox');
    let core_path = is_firefox ? "core-mt" : "core"
    console.log("loading ffmpeg from",core_path,"is_firefox:",is_firefox)
    // the documention say "toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.", but ffmpeg.wasm crash without toBlobURL for some reason
    let coreblob = await toBlobURL(
      `/js/${core_path}/ffmpeg-core.js`,
      "text/javascript",
    )
    let wasmblob = await toBlobURL(
      `/js/${core_path}/ffmpeg-core.wasm`,
      "application/wasm",
    )
    let workerblob = undefined;
    if (is_firefox) {
      workerblob = await toBlobURL(
        `/js/${core_path}/ffmpeg-core.worker.js`, "text/javascript"
      );
    }
    await this.ffmpeg.load({
      coreURL: coreblob,
      wasmURL: wasmblob,
      workerURL: workerblob
    });
    this.loaded = true;

  }

  /**
   * Execute an FFmpeg command and return the output as a File with Blob URL.
   * @param inputFile - Input file path or URL.
   * @param args - Array of FFmpeg arguments.
   * @returns a file with Blob URL of the output.
   */
  async exec(inputFileName: string, OutputMimeType: string, inputBlob: string, outputFile: string, args: string[]): Promise<File> {
    if (!this.loaded) {
      throw new Error("FFmpeg not loaded yet. Call the 'load' method.");
    }

    await this.ffmpeg.writeFile(inputFileName, await fetchFile(inputBlob));

    const commandList = ["-hide_banner", "-i", inputFileName, ...args, outputFile].filter(el => (el !== '')) // remove empty strings
    console.log(`running ffmpeg command [${commandList}]`)
    await this.ffmpeg.exec(commandList);

    const data = await this.ffmpeg.readFile(outputFile);
    const blob = new Blob([data], { type: OutputMimeType });
    return new File([blob], outputFile, { type: OutputMimeType })
  }
}

export default ffmpegCls;
