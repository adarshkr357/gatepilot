        // ----------------------------------------------------
        // Auto Code Generator for Multi-Language Tabs
        // ----------------------------------------------------
        const langs = [
            { id: 'js', name: 'Node.js' },
            { id: 'python', name: 'Python' },
            { id: 'go', name: 'Go' },
            { id: 'rust', name: 'Rust' },
            { id: 'java', name: 'Java' },
            { id: 'cpp', name: 'C++' },
            { id: 'php', name: 'PHP' }
        ];

        document.querySelectorAll('.auto-code').forEach(el => {
            const id = el.getAttribute('data-id');
            const method = el.getAttribute('data-method');
            const path = el.getAttribute('data-path');
            const headersStr = el.getAttribute('data-headers') || '{}';
            const bodyStr = el.getAttribute('data-body') || '';

            const headers = JSON.parse(headersStr);
            const bodyObj = bodyStr ? JSON.parse(bodyStr) : null;
            const url = `http://localhost:3000${path}`;

            const snippets = {
                js: `const axios = require('axios');\n\naxios({\n  method: '${method}',\n  url: '${url}',\n  headers: {\n${Object.keys(headers).map(k => `    '${k}': '${headers[k]}'`).join(',\n')}\n  }${bodyObj ? `,\n  data: ${JSON.stringify(bodyObj, null, 2)}` : ''}\n}).then(response => {\n  console.log(response.data);\n}).catch(console.error);`,
                
                python: `import requests\n\nurl = "${url}"\nheaders = {\n${Object.keys(headers).map(k => `    "${k}": "${headers[k]}"`).join(',\n')}\n}\n${bodyObj ? `json_data = ${JSON.stringify(bodyObj, null, 4)}\n` : ''}\nresponse = requests.${method.toLowerCase()}(url, headers=headers${bodyObj ? ', json=json_data' : ''})\nprint(response.json())`,

                go: `package main\n\nimport (\n    "fmt"\n    "net/http"\n    "io/ioutil"\n${bodyObj ? '    "strings"\n' : ''})\n\nfunc main() {\n    client := &http.Client{}\n${bodyObj ? `    payload := strings.NewReader(\`${JSON.stringify(bodyObj).replace(/"/g, '\\"')}\`)\n` : ''}    req, _ := http.NewRequest("${method}", "${url}", ${bodyObj ? 'payload' : 'nil'})\n${Object.keys(headers).map(k => `    req.Header.Add("${k}", "${headers[k]}")`).join('\n')}\n\n    resp, _ := client.Do(req)\n    defer resp.Body.Close()\n    body, _ := ioutil.ReadAll(resp.Body)\n    fmt.Println(string(body))\n}`,

                rust: `use reqwest::header;\n\n#[tokio::main]\nasync fn main() -> Result<(), Box<dyn std::error::Error>> {\n    let mut headers = header::HeaderMap::new();\n${Object.keys(headers).map(k => `    headers.insert("${k}", header::HeaderValue::from_static("${headers[k]}"));`).join('\n')}\n\n    let client = reqwest::Client::new();\n    let res = client.${method.toLowerCase()}("${url}")\n        .headers(headers)\n${bodyObj ? `        .json(&serde_json::json!(${JSON.stringify(bodyObj)}))\n` : ''}        .send()\n        .await?\n        .text()\n        .await?;\n\n    println!("{}", res);\n    Ok(())\n}`,

                java: `import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        HttpClient client = HttpClient.newHttpClient();\n        HttpRequest request = HttpRequest.newBuilder()\n            .uri(URI.create("${url}"))\n${Object.keys(headers).map(k => `            .header("${k}", "${headers[k]}")`).join('\n')}\n            .${method}(${bodyObj ? `HttpRequest.BodyPublishers.ofString("${JSON.stringify(bodyObj).replace(/"/g, '\\"')}")` : 'HttpRequest.BodyPublishers.noBody()'})\n            .build();\n\n        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n        System.out.println(response.body());\n    }\n}`,

                cpp: `#include <iostream>\n#include <cpr/cpr.h>\n\nint main() {\n    cpr::Response r = cpr::${method === 'GET' ? 'Get' : method === 'POST' ? 'Post' : method === 'PATCH' ? 'Patch' : 'Delete'}(\n        cpr::Url{"${url}"},\n        cpr::Header{${Object.keys(headers).map(k => `{"${k}", "${headers[k]}"}`).join(', ')}}\n${bodyObj ? `        , cpr::Body{"${JSON.stringify(bodyObj).replace(/"/g, '\\"')}"}\n` : ''}    );\n    std::cout << r.text << std::endl;\n    return 0;\n}`,

                php: `<?php\n$ch = curl_init();\ncurl_setopt($ch, CURLOPT_URL, "${url}");\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);\ncurl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");\n${bodyObj ? `curl_setopt($ch, CURLOPT_POSTFIELDS, '${JSON.stringify(bodyObj)}');\n` : ''}curl_setopt($ch, CURLOPT_HTTPHEADER, array(\n${Object.keys(headers).map(k => `    "${k}: ${headers[k]}"`).join(',\n')}\n));\n$output = curl_exec($ch);\ncurl_close($ch);\necho $output;\n?>`
            };

            let tabsHTML = `<div class="tabs"><div class="tab-list">`;
            langs.forEach((lang, index) => {
                tabsHTML += `<button class="tab-btn ${index === 0 ? 'active' : ''}" data-target="${id}-${lang.id}">${lang.name}</button>`;
            });
            tabsHTML += `</div>`;

            langs.forEach((lang, index) => {
                const escapedCode = snippets[lang.id].replace(/</g, '&lt;').replace(/>/g, '&gt;');
                tabsHTML += `<div class="tab-content ${index === 0 ? 'active' : ''}" id="${id}-${lang.id}">
                    <div class="code-block"><pre><code>${escapedCode}</code></pre></div>
                </div>`;
            });
            tabsHTML += `</div>`;

            el.innerHTML = tabsHTML;
        });

        // Event listeners for dynamic tabs
        document.querySelectorAll('.auto-code .tab-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const container = e.target.closest('.auto-code');
                container.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                container.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                const targetId = button.getAttribute('data-target');
                document.getElementById(targetId).classList.add('active');
            });
        });

        // ----------------------------------------------------
        // UI & Scrolling Logic
        // ----------------------------------------------------

        // Mobile Menu Toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if(menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Robust Scroll Spy Logic using getBoundingClientRect
        const sections = document.querySelectorAll('.doc-section');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', () => {
            let current = 'getting-started';
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                // If the top of the section is anywhere in the upper half of the screen
                if (rect.top <= window.innerHeight / 2) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });

        // Initial check in case user loads page scrolled down
        window.dispatchEvent(new Event('scroll'));

        // Close sidebar on mobile when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                }
            });
        });
