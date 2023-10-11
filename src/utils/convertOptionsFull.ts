export interface ConvertOption {
  extension: string;
  mimetype: string;
  full_string: string;
  optional_convert_routes: ConvertRoutes;
  useful: number; // number between 0 and 1
}
interface ConvertRoutes {
  [format: string]: string[];
}
interface ConvertOptionsType {
  [extension: string]: ConvertOption;
}
// --- video
const normalVideoRoutes_video: ConvertRoutes = {
  mp4: [],
  mkv: ["-vcodec","copy"],
  avi: [],
  gif: ["-filter_complex","[0:v] fps=15","-vsync","passthrough"]
  // webm: "", // FIXME: mp4->webm is complicated and took a lot of memory
};

const normalVideoRoutes_audio: ConvertRoutes = {
  mp3: ["-vn"],
  wav: ["-vn","-ac","2"],
  ogg: ["-vn"],
};
const normalVideoRoutes = {
  ...normalVideoRoutes_video,
  ...normalVideoRoutes_audio,
};
// --- image

const normalImageRoutes = {
  // for now, I am not sure if thats is true or not.
  jpg: [],
  jpeg: [],
  png: [],
  bmp: [],
};
// --- audio
const normalAudioRoutes = {
  mp3: ["-acodec","libmp3lame"],
  wav: [],
  ogg: ["-acodec","libvorbis"],
  aac: ["-acodec","libfaac"],
};
export const ConvertOptions: ConvertOptionsType = {
  // -- video
  mp4: {
    extension: "mp4",
    mimetype: "video/mp4",
    full_string: "MPEG-4 Video",
    optional_convert_routes: normalVideoRoutes,
    useful: 1,
  },
  avi: {
    extension: "avi",
    mimetype: "video/msvideo",
    full_string: "AVI Video",
    optional_convert_routes: normalVideoRoutes,
    useful: 0.6,
  },
  mkv: {
    extension: "mkv",
    mimetype: "video/matroska",
    full_string: "Matroska Video",
    optional_convert_routes: copyWith(normalVideoRoutes, {
      mp4: ["-codec","copy"],
    }),
    useful: 0.5,
  },
  mov: {
    extension: "mov",
    mimetype: "video/quicktime",
    full_string: "Apple QuickTime Video",
    optional_convert_routes: copyWith(normalImageRoutes, {
      mp4: ["-vcodec","mpeg2video","-acodec","mp3"],
    }),
    useful: 0.7,
  },
  webm: {
    extension: "webm",
    mimetype: "video/webm",
    full_string: "WebM Video",
    optional_convert_routes: copyWith(normalVideoRoutes, {
      mp4: ["-crf","1","-c:v","libx264"],
    }),
    useful: 0.4,
  },
  gif: {
    // for now, assume that gif is a video and not image
    extension: "gif",
    mimetype: "image/gif",
    full_string: "GIF Animated Image",
    optional_convert_routes: normalVideoRoutes_video,
    useful: 0.9,
  },
  // -- audio
  mp3: {
    extension: "mp3",
    mimetype: "audio/mpeg",
    full_string: "MP3 Audio",
    optional_convert_routes: normalAudioRoutes,
    useful: 0.35, // the top of audio
  },
  ogg: {
    extension: "ogg",
    mimetype: "audio/ogg",
    full_string: "Ogg Audio",
    optional_convert_routes: normalAudioRoutes,
    useful: 0.2,
  },
  wav: {
    extension: "wav",
    mimetype: "audio/wav",
    full_string: "WAV Audio",
    optional_convert_routes: normalAudioRoutes,
    useful: 0.3,
  },
  acc:{
    extension:"aac",
    mimetype:"audio/aac",
    full_string:"Advanced Audio Coding",
    optional_convert_routes:normalAudioRoutes,
    useful:0.15
  },
  // -- image
  png: {
    extension: "png",
    mimetype: "image/png",
    full_string: "PNG Image",
    optional_convert_routes: normalImageRoutes,
    useful: 0.15, // the top of the images
  },
  jpg: {
    extension: "jpg",
    mimetype: "image/jpeg",
    full_string: "JPEG Image",
    optional_convert_routes: normalImageRoutes,
    useful: 0.1,
  },
  bmp:{
    extension:"bmp",
    mimetype:"image/bmp",
    full_string:"Windows Bitmap Image",
    optional_convert_routes:normalImageRoutes,
    useful:0.05
  }
};

function copyWith(
  mp4VideoConvertRoutes: ConvertRoutes,
  with_json: ConvertRoutes
): ConvertRoutes {
  return { ...mp4VideoConvertRoutes, ...with_json };
}
function searchByMimeType(mimetype: string,){
  return  Object.values(ConvertOptions).find(
    (format) => format.mimetype === mimetype
  );
}
export function getByMimeType(
  mimetype: string,
  ext?: string
): ConvertOption | undefined {
  var format;
  format = searchByMimeType(mimetype)
  if (format===undefined){ // try without x-
    if (mimetype.includes("x-")){
    console.log("cannot find the format normally. trying with 'x-'")
    format = searchByMimeType(mimetype.replace("x-",""))
    }   

  }
  return format;
}
