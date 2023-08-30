import JSZip from "jszip";

export async function createZipFile(
    files: File[],
    comment:string,
): Promise<Blob> {
    // Create a new instance of JSZip
    const zip = new JSZip();

    // Add each blob to the zip file
    for (let i = 0; i < files.length; i++) {
        const blob = files[i];
        const blobName = files[i].name;
        zip.file(blobName, blob);
        //
    }

    const zipContent = await zip.generateAsync({ type: "blob",comment:comment });
    // const zipFile = new File([zipContent],zipFileName,{type:zipContent.type})


    return zipContent
}
