interface ConvertOption {
  extension: string;
  mimetype: string;
  full_string: string;
  optional_convert_routes: ConvertRoutes;
}
interface ConvertRoutes {
  [format: string]: string;
}
interface ConvertOptionsType {
  [extension: string]: ConvertOption;
}
// --- video
const normalVideoRoutes_video: ConvertRoutes = {
  mp4: "",
  mkv: "-vcodec copy",
  avi: "",
  gif: "",
  flv: "",
  webm: "-c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -c:a libopus",
};

const normalVideoRoutes_audio: ConvertRoutes = {
  mp3: "-vn",
  wav: "-vn -ac 2",
  ogg: "-vn",
};
const normalVideoRoutes = {
  ...normalVideoRoutes_video,
  ...normalVideoRoutes_audio,
};
// --- image

const normalImageRoutes = { // for now, I am not sure if thats is true or not.
  jpg: "",
  jpeg: "",
  png: "",
  bmp: "",
};
// --- audio
const normalAudioRutes = {
  mp3: "-acodec libmp3lame",
  wav: "",
  ogg: "-acodec libvorbis",
  aac: "-acodec libfaac",
};
export const ConvertOptions: ConvertOptionsType = {
    // -- video
  mp4: {
    extension: "mp4",
    mimetype: "video/mp4",
    full_string: "MPEG-4 Video",
    optional_convert_routes: normalVideoRoutes,
  },
  avi: {
    extension: "avi",
    mimetype: "video/x-msvideo",
    full_string: "AVI Video",
    optional_convert_routes: normalVideoRoutes,
  },
  mkv: {
      extension: "mkv",
      mimetype: "video/x-matroska",
      full_string: "Matroska Video",
      optional_convert_routes: copywith(normalVideoRoutes, {
          mp4: "-codec copy",
        }),
    },
    mov: {
        extension: "mov",
        mimetype: "video/quicktime",
        full_string: "Apple QuickTime Video",
        optional_convert_routes: copywith(normalImageRoutes, {
            mp4: "-vcodec mpeg2video -acodec mp3",
        }),
    },
    webm: {
      extension: "webm",
      mimetype: "video/webm",
      full_string: "WebM Video",
      optional_convert_routes: copywith(normalVideoRoutes, {
        mp4: "-crf 1 -c:v libx264",
      }),
    },
    gif: {
        // for now, assume that gif is a video and not image
        extension: "gif",
        mimetype: "image/gif",
        full_string: "GIF Animated Image",
        optional_convert_routes: normalVideoRoutes_video,
    },
  // -- audio
  mp3: {
    extension: "mp3",
    mimetype: "audio/mpeg",
    full_string: "MP3 Audio",
    optional_convert_routes: normalAudioRutes,
  },
  ogg: {
    extension: "ogg",
    mimetype: "audio/ogg",
    full_string: "Ogg Audio",
    optional_convert_routes: normalAudioRutes,
  },
  wav: {
    extension: "wav",
    mimetype: "audio/wav",
    full_string: "WAV Audio",
    optional_convert_routes: normalAudioRutes,
  },
  // -- image
  png: {
    extension: "png",
    mimetype: "image/png",
    full_string: "PNG Image",
    optional_convert_routes: normalImageRoutes,
  },
  jpg: {
    extension: "jpg",
    mimetype: "image/jpeg",
    full_string: "JPEG Image",
    optional_convert_routes: normalImageRoutes,
  },
};

function copywith(
  mp4VideoConvertRoutes: ConvertRoutes,
  with_json: ConvertRoutes
): ConvertRoutes {
  return { ...mp4VideoConvertRoutes, ...with_json };
}
export function getByMimeType(mimetype:string){
    const format = Object.values(ConvertOptions).find(format => format.mimetype === mimetype);
    return format ? format.optional_convert_routes : null;

}