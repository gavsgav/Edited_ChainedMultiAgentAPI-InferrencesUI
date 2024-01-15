<script>
        document.addEventListener('DOMContentLoaded', function() {
            fetch('/get-text-files')
                .then(response => response.json())
                .then(files => {
                    for (let i = 1; i <= 6; i++) {
                        const fileDropdown = document.createElement('select');
                        fileDropdown.id = 'file-dropdown-' + i;
                        fileDropdown.onchange = () => loadFileContent(i, fileDropdown.value);
        
                        // Default option
                        const defaultOption = document.createElement('option');
                        defaultOption.textContent = 'Select a file for Agent ' + i;
                        fileDropdown.appendChild(defaultOption);
        
                        // Add file options to the dropdown
                        files.forEach(file => {
                            const option = document.createElement('option');
                            option.value = file;
                            option.textContent = file;
                            fileDropdown.appendChild(option);
                        });
        
                        document.getElementById('agents-container').appendChild(fileDropdown);
                        }
                    })
                    .catch(error => console.error('Error:', error));
            });

            function loadFileContent(agentId, fileName) {
                if (fileName) {
                    fetch(`/get-file-content/${encodeURIComponent(fileName)}`)
                        .then(response => response.json())
                        .then(content => {
                            const instructionInput = document.getElementById('system-instruction-' + agentId);
                            instructionInput.value = content;
                        })
                        .catch(error => console.error('Error loading file:', error));
                }
            }
    
    </script>

    <script>
        const chatContainer = document.getElementById('chat-container');
const agentsContainer = document.getElementById('agents-container');
// Dynamically create agent input fields
for (let i = 1; i <= 6; i++) {
    let agentInput = document.createElement('input');
    agentInput.type = 'text';
    agentInput.id = 'system-instruction-' + i;
    agentInput.placeholder = 'System instruction for Agent ' + i;
    agentInput.className = 'agent-input';
    agentsContainer.appendChild(agentInput);
}

function startConversation() {
    const userMessage = document.getElementById('user-input').value;
    const taskFlow = document.getElementById('task-flow').value.split(',').map(Number);
    document.getElementById('user-input').value = '';
    addToChat(`You: ${userMessage}`);
    let promiseChain = Promise.resolve(userMessage);

    taskFlow.forEach(agentId => {
        if (agentId >= 1 && agentId <= 6) {
            const instructionInput = document.getElementById('system-instruction-' + agentId);
            // Check if the input field is not empty, null, or undefined
            if (instructionInput && instructionInput.value.trim() !== '') {
                promiseChain = promiseChain.then(previousMessage => {
                    return sendMessage(previousMessage, instructionInput.value).then(response => {
                        addToChat(`Agent ${agentId}: ${response}`);
                        return response;
                    });
                });
            }
        }
    });

    promiseChain.catch(error => console.error('Error in conversation:', error));
}


function sendMessage(content, instruction) {
    const data = {
        messages: [
            {"role": "system", "content": instruction},
            {"role": "user", "content": content}
        ],
        temperature: 1.31,
        max_tokens: -1,
        stream: false
    };
    return fetch('http://10.252.0.215:8000/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Assuming the response contains a field 'choices' with the reply
        // The structure of this line may change based on the actual response structure
        return data.choices[0].message.content; // Adjust this line based on the response
    });
}
function addToChat(message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

    </script>