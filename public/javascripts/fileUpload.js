FilePond.registerPlugin(
    FilePondPluginPdfPreview,
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
)

FilePond.setOptions({
    stylePanelAspectRatio: 150 / 100,
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight: 150,
    allowPdfPreview: true,
    pdfPreviewHeight: 320,
    pdfComponentExtraParams: 'toolbar=0&view=fit&page=1'
})

FilePond.parse(document.body);

// function openBase64InNewTab (data, mimeType) {
//     var byteCharacters = atob(data);
//     var byteNumbers = new Array(byteCharacters.length);
//     for (var i = 0; i < byteCharacters.length; i++) {
//         byteNumbers[i] = byteCharacters.charCodeAt(i);
//     }
//     var byteArray = new Uint8Array(byteNumbers);
//     var file = new Blob([byteArray], { type: mimeType + ';base64' });
//     var fileURL = URL.createObjectURL(file);
//     window.open(fileURL);
// }

// openBase64InNewTab()
// module.exports = openBase64InNewTab