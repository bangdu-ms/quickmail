const fileInput = document.getElementById('file-input');
const valuesForm = document.getElementById('values-form');
const tagsList = document.getElementById('tags-list');
const templateElement = document.getElementById('template');
const previewElement = document.getElementById('preview');
let fileContents = '';
let tags = [];

// Read the uploaded file and list the tags
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    fileContents = event.target.result;
    templateElement.value = fileContents;
    previewElement.value = fileContents;
    const tagRegex = /{{\s*(\w+)\s*}}/g;
    tags = [];
    let match;
    while ((match = tagRegex.exec(fileContents)) !== null) {
      tags.push(match[1]);
    }
    updateTagsList();
  };
  reader.readAsText(file);
});

// Replace the tags with the values from the form
valuesForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = {};
  tags.forEach((tag) => {
    values[tag] = document.getElementById(`${tag}-input`).value;
  });
  const replacedContents = templateElement.value.replace(/{{\s*(\w+)\s*}}/g, (_, tag) => {
    return values[tag] || '';
  });
  previewElement.value = replacedContents;
});

// Add new tag input on the fly
templateElement.addEventListener('input', (event) => {
  const caretPos = event.target.selectionStart;
  const inputText = event.target.value;
  const tagRegex = /{{\s*(\w+)\s*}}/g;
  let match;
  while ((match = tagRegex.exec(inputText)) !== null) {
    const tag = match[1];
    if (!tags.includes(tag)) {
      tags.push(tag);
      const newInput = createInputField(tag);
      tagsList.appendChild(newInput);
    }
  }
});

// Create new input field
function createInputField(tag) {
  const inputField = document.createElement('div');
  inputField.classList.add('form-group');
  inputField.innerHTML = `
    <label for="${tag}-input">${tag}</label>
    <div class="input-group">
      <input type="text" class="form-control" id="${tag}-input" name="${tag}">
      <div class="input-group-append">
        <button class="btn btn-outline-secondary" type="button" onclick="insertTag('${tag}')">Add Tag</button>
      </div>
    </div>
  `;
  return inputField;
}

// Update tags list with the current set of tags
function updateTagsList() {
  tagsList.innerHTML = tags.map((tag) => createInputField(tag).outerHTML).join('');
}

// Insert tag at current caret position
function insertTag(tag) {
  const templateText = templateElement.value;
  const caretPos = templateElement.selectionStart;
  const newText = templateText.substring(0, caretPos) + `{{ ${tag} }}` + templateText.substring(caretPos);
  templateElement.value = newText;
  templateElement.selectionStart = caretPos + tag.length + 5;
  templateElement.selectionEnd = caretPos + tag.length + 5;
  templateElement.focus();
}
