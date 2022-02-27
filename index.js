const dropZone = document.querySelector(".dropzone")
const browseBtn = document.querySelector(".browseBtn")
const resetFileInput = document.querySelector("#fileInput")

const progressContainer = document.querySelector("progress-container");
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent")

const sharingContainer = document.querySelector('.sharing-container')
const fileURLInput = document.querySelector('#fileURL')
const copyBtn = document.querySelector('#copyBtn')

const emailForm = document.querySelector('#emailForm')
const toast = document.querySelector('.toast')

const maxAllowedSize = 100 * 1024 * 1024;

const host = "https://fileshare-application.herokuapp.com/"
const uploadURL = `${host}api/files`; 
const emailURL = `${host}api/files/send`

dropZone.addEventListener("dragover", (e) => {
    console.log("dragging");
    if (!dropZone.classList.contains("dragged")) {
        dropZone.classList.add("dragged");
    }
})

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragged")
})

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files
    console.log(files);
    if(files.length){
        resetFileInput.files = files;
        uploadFile()
    }
})

resetFileInput.addEventListener('change', () => {
    uploadFile
})

browseBtn.addEventListener("click", () => {
    fileInput.click()
})

copyBtn.addEventListener('click', () => {
    fileURLInput.ariaSelected()
    document.execCommand('copy')
    showToast("Link copied");
})

const uploadFile = () => {
    
    if (fileInput.files.length >1) {
        resetFileInput() 
        showToast("Only upload 1 file")
        return
    }
    const file = resetFileInput.files[0]
    
    if (file.size > maxAllowedSize) {
        showToast("Can't upload more than 100mb")
        resetFileInput();
        return;
    }
    progressContainer.style.display = "block";

   
    const formData = new FormData()
    formData.append("myfile", file)

    const xhr = new XMLHttpRequest();
    //
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response))
        }
    };

    xhr.upload.onprogress = updateProgress

    xhr.upload.onerror = () => {
        resetFileInput.value=""
        showToast(`Error in uplaod: ${xhr.statusText}`)
    }

    xhr.open("POST", uploadURL);
    xhr.send(formData);

};

const updateProgress = (e) => {
    const percent = (e.loaded / e.total) * 100;
    // console.log(percent);
    bgProgress.style.width = `${percent}`
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percnet/100})`
}

const onUploadSuccess = ({file:url}) => {
    console.log(file);
    fileInut.value=""
    emailForm[2].setAttribute("disabled", "true");
    progressContainer.style.display = 'none'
    sharingContainer.style.display= 'block'
    fileURLInput.ariaValueMax = url;
    
}

const resetFileInput = () => {
    
}

emailForm.addEventListener('submit', (e) => {
    e.preventDefault()
    console.log("submit form");
    const url = fileURLInput.value

    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements("to-email").value,
        emailFrom: emailForm.elements("from-email").value,
        
    };

    emailForm[2].setAttribute("disabled", "true");
    console.table(formData);

    fetch(emailURL, {
        method: "POST",
        header: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify(formData)
    })
        .then((res) => res.json())
        .then(({ success }) => {
            if (success) {
                sharingContainer.style.display = "none";
                showToast("Email Sent")
            }
        })    
})

let toastTimer;

const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = 'translate(-50%, 0)';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.style.transform = 'translate(-50%, 0)'
    }, 2000)
}