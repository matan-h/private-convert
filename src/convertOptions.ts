interface ConvertOption {
    label: string;
    value: string;
  }
interface ConvertOptionFull{
  extension: string; // mov 
  mimetype: string; // video/quicktime
  full_string:string; // Apple QuickTime Video
}
interface ConvertRoute{
  srcExtension:string;
  dstExtension:string;
  ffmpeg_options:string;
}
  const gifOptions: ConvertOption[] = [
    { label: 'gif->png', value: 'png' },
    { label: 'gif->mp4)', value: 'mp4' }
  ];
  
  const audioOptions: ConvertOption[] = [
    { label: 'mp3', value: 'mp3' },
    { label: 'wav', value: 'wav' },
    { label: 'ogg', value: 'ogg' }
  ];
  
  const videoOptions: ConvertOption[] = [
    { label: 'mp4', value: 'mp4' },
    { label: 'webm', value: 'webm' },
    { label: 'gif', value: 'gif' },
    { label: 'mkv', value: 'mkv' },
    { label: 'mov', value: 'mov' },
    { label: 'wmv', value: 'wmv' },
    { label: 'avi', value: 'avi' },
    { label: 'flv', value: 'flv' },
    
  ];
  
  const imageOptions: ConvertOption[] = [
    { label: 'jpg', value: 'jpg' },
    { label: 'png', value: 'png' },
    { label: 'gif', value: 'gif' }
  ];
  const mixedOptions: ConvertOption[] = [
    { label: 'Convert individually', value: 'convert-individually' }
  ];
  
  export const getConvertOptions = (fileTypes: string[],isAnimatedGif: boolean): ConvertOption[] => {
    const areAllAudio = fileTypes.every(type => type.startsWith('audio'));
    const areAllVideo = fileTypes.every(type => type.startsWith('video'));
    const areAllImage = fileTypes.every(type => type.startsWith('image'));
    const areAllGifImage = areAllImage && fileTypes.every(type => type === 'image/gif');
  
    if (areAllAudio) {
      return audioOptions;
    } else if (areAllVideo) {
      return videoOptions;
    } else if (areAllGifImage) {
      return gifOptions;
    } else if (areAllImage) {
      return imageOptions;
    } else {
      return mixedOptions;
    }
  };
  
  