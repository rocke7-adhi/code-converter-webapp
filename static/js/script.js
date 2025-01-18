$(document).ready(function() {
    const body = $('body');
    const themeToggle = $('#theme-toggle');
    
    // Theme icons
    const icons = {
        light: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
        dark: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
        system: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>'
    };

    // Get system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Get saved theme from localStorage or default to 'system'
    const savedTheme = localStorage.getItem('theme') || 'system';
    
    // Function to update theme
    function updateTheme(theme) {
        localStorage.setItem('theme', theme);
        
        if (theme === 'system') {
            if (prefersDark.matches) {
                body.removeClass('light-mode dark-mode').addClass('dark-mode');
            } else {
                body.removeClass('light-mode dark-mode').addClass('light-mode');
            }
            themeToggle.html(icons.system);
        } else if (theme === 'dark') {
            body.removeClass('light-mode dark-mode').addClass('dark-mode');
            themeToggle.html(icons.dark);
        } else {
            body.removeClass('light-mode dark-mode').addClass('light-mode');
            themeToggle.html(icons.light);
        }
    }

    // Initialize theme
    updateTheme(savedTheme);

    // Create theme selector dropdown
    const themeMenu = $('<div class="theme-menu">').insertAfter(themeToggle);
    themeMenu.html(`
        <div class="theme-option" data-theme="light">
            ${icons.light}
            <span>Light</span>
        </div>
        <div class="theme-option" data-theme="dark">
            ${icons.dark}
            <span>Dark</span>
        </div>
        <div class="theme-option" data-theme="system">
            ${icons.system}
            <span>System</span>
        </div>
    `);

    // Toggle menu visibility
    themeToggle.on('click', function(e) {
        e.stopPropagation();
        themeMenu.toggleClass('show');
    });

    // Handle theme selection
    $('.theme-option').on('click', function() {
        const newTheme = $(this).data('theme');
        updateTheme(newTheme);
        themeMenu.removeClass('show');
    });

    // Close menu when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.theme-menu').length) {
            themeMenu.removeClass('show');
        }
    });

    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === 'system') {
            updateTheme('system');
        }
    });

    // Initialize CodeMirror for input
    const inputEditor = CodeMirror.fromTextArea(document.getElementById("input_code"), {
        lineNumbers: true,
        mode: "javascript", // Default mode
        theme: "monokai",
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        extraKeys: {"Ctrl-Space": "autocomplete"},
        highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true}
    });

    // Initialize CodeMirror for output
    const outputEditor = CodeMirror.fromTextArea(document.getElementById("output-code"), {
        lineNumbers: true,
        mode: "javascript", // Default mode
        theme: "monokai",
        readOnly: true,
        lineWrapping: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    });

    // Update mode based on language selection
    $('#target_language').on('change', function() {
        const language = $(this).val().toLowerCase();
        const modeMap = {
            'javascript': 'javascript',
            'python': 'python',
            'html': 'xml',
            'css': 'css',
            // Add more language mappings as needed
        };
        outputEditor.setOption('mode', modeMap[language] || 'javascript');
    });

    // Modify the form submission to include input_language
    $('#conversion-form').on('submit', function(e) {
        e.preventDefault();
        
        const input_code = inputEditor.getValue();
        const input_language = $('#input_language').val();
        const target_language = $('#target_language').val();
        const selected_model = $('#selected_model').val();
        
        outputEditor.setValue('Converting your code... Please wait...');

        $.ajax({
            url: '/convert',
            method: 'POST',
            data: {
                input_code: input_code,
                input_language: input_language,
                target_language: target_language,
                selected_model: selected_model
            },
            success: function(response) {
                outputEditor.setValue(response.converted_code);
            },
            error: function() {
                outputEditor.setValue('An error occurred during conversion. Please try again.');
            }
        });
    });

    // Modify the explain button to include input_language
    $('#explain-button').on('click', function() {
        const input_code = inputEditor.getValue();
        const input_language = $('#input_language').val();
        const target_language = $('#target_language').val();
        const selected_model = $('#selected_model').val();
        
        outputEditor.setValue('Explaining your code... Please wait...');

        $.ajax({
            url: '/explain',
            method: 'POST',
            data: {
                input_code: input_code,
                input_language: input_language,
                target_language: target_language,
                selected_model: selected_model
            },
            success: function(response) {
                outputEditor.setValue(response.explanation);
            },
            error: function() {
                outputEditor.setValue('An error occurred during explanation. Please try again.');
            }
        });
    });

    // Modify clear button to work with CodeMirror
    $('#clear-button').on('click', function() {
        inputEditor.setValue('');
        outputEditor.setValue('');
    });

    // Modify copy button to work with CodeMirror
    $('#copy-button').on('click', function() {
        const outputText = outputEditor.getValue();
        if (!outputText) {
            $(this).attr('title', 'Nothing to copy!');
            setTimeout(() => {
                $(this).attr('title', 'Copy to clipboard');
            }, 2000);
            return;
        }

        navigator.clipboard.writeText(outputText)
            .then(() => {
                $(this).attr('title', 'Copied!');
                setTimeout(() => {
                    $(this).attr('title', 'Copy to clipboard');
                }, 2000);
            })
            .catch(() => {
                $(this).attr('title', 'Failed to copy!');
                setTimeout(() => {
                    $(this).attr('title', 'Copy to clipboard');
                }, 2000);
            });
    });

    // Modify download button to work with CodeMirror
    $('#download-button').on('click', function() {
        const outputText = outputEditor.getValue();
        if (!outputText) {
            $(this).attr('title', 'Nothing to download!');
            setTimeout(() => {
                $(this).attr('title', 'Download code');
            }, 2000);
            return;
        }

        try {
            const blob = new Blob([outputText], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted-code-${timestamp}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            $(this).attr('title', 'Downloaded!');
            setTimeout(() => {
                $(this).attr('title', 'Download code');
            }, 2000);
        } catch (error) {
            $(this).attr('title', 'Download failed!');
            setTimeout(() => {
                $(this).attr('title', 'Download code');
            }, 2000);
        }
    });

    // Modify fullscreen to work with CodeMirror
    $('#fullscreen-button').on('click', function() {
        const outputColumn = $('.output-column')[0];
        const button = $(this);
        
        if (!document.fullscreenElement) {
            outputColumn.requestFullscreen();
            outputEditor.refresh(); // Refresh CodeMirror after entering fullscreen
        } else {
            document.exitFullscreen();
        }
    });

    // File upload handling
    const fileInput = $('#code-file-input');
    const uploadButton = $('#upload-button');

    // Handle click on upload button
    uploadButton.on('click', function() {
        fileInput.click();
    });

    // Handle file selection
    fileInput.on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            readFile(file);
        }
    });

    // Function to read file contents
    function readFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            inputEditor.setValue(content);
            
            // Detect language from file name first
            let detectedLang = detectLanguageFromFileName(file.name);
            
            // If no language detected from file name, try content
            if (!detectedLang) {
                detectedLang = detectLanguageFromContent(content);
            }
            
            // Update the input language select if language was detected
            if (detectedLang) {
                $('#input_language').val(detectedLang);
            }
        };
        reader.readAsText(file);
    }

    // Function to detect language from file extension
    function detectLanguageFromFileName(fileName) {
        const extensionMap = {
            'java': 'Java',
            'js': 'JavaScript',
            'py': 'Python',
            'r': 'R',
            'c': 'C',
            'cs': 'Csharp',
            'jl': 'Julia',
            'go': 'Golang',
            'pl': 'Perl',
            'm': 'Matlab',
            'kt': 'Kotlin',
            'php': 'PHP',
            'rs': 'Rust',
            'rb': 'Ruby',
            'lua': 'Lua',
            'ts': 'TypeScript',
            'sas': 'SAS',
            'hx': 'Haxe',
            'lisp': 'Lisp',
            'f': 'Fortran',
            'scala': 'Scala',
            'as': 'ActionScript',
            'asm': 'Assembly',
            'clj': 'Clojure',
            'coffee': 'CoffeeScript',
            'dart': 'Dart',
            'cbl': 'COBOL',
            'groovy': 'Groovy',
            'ex': 'Elixir',
            'erl': 'Erlang',
            'pas': 'Pascal',
            'hs': 'Haskell',
            'swift': 'Swift',
            'rkt': 'Racket',
            'ml': 'OCaml',
            'scm': 'Scheme',
            'cr': 'Crystal',
            'elm': 'Elm',
            'fs': 'Fsharp',
            'tcl': 'Tcl',
            'vb': 'VB.NET',
            'vala': 'Vala',
            'adb': 'Ada',
            'objc': 'Objective_C'
        };

        const extension = fileName.split('.').pop().toLowerCase();
        return extensionMap[extension] || null;
    }

    // Function to detect language from code content
    function detectLanguageFromContent(code) {
        // Common patterns to identify languages
        const patterns = {
            'Python': /(import\s+[a-zA-Z_][a-zA-Z0-9_]*|def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(|print\s*\()/,
            'JavaScript': /(const|let|var)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=|function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/,
            'Java': /(public|private|protected)\s+(class|interface|enum)|System\.out\.println/,
            'Csharp': /(using\s+[a-zA-Z.]+;|namespace\s+[a-zA-Z.]+|Console\.WriteLine)/,
            'PHP': /(<\?php|\$[a-zA-Z_][a-zA-Z0-9_]*|echo\s)/,
            'Ruby': /(require|def\s+[a-zA-Z_][a-zA-Z0-9_]*|puts\s)/,
            'Golang': /(package\s+[a-zA-Z_][a-zA-Z0-9_]*|func\s+[a-zA-Z_][a-zA-Z0-9_]*|fmt\.Println)/,
            'Kotlin': /(fun\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(|val\s+[a-zA-Z_][a-zA-Z0-9_]*\s*=)/,
            'TypeScript': /(const|let|var)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=|function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(|console\.log\(|:\s+[a-zA-Z_$][a-zA-Z0-9_$]*/,
            'Pascal': /(program\s+[a-zA-Z0-9_]+;|begin\s+.*end\.)/,
            'Haskell': /(module\s+[a-zA-Z0-9_]+|import\s+[a-zA-Z0-9_.]+)/,
            'VB.NET': /(Imports\s+[a-zA-Z0-9_.]+|Sub\s+[a-zA-Z0-9_]+\()/,
            'Swift': /(import\s+[a-zA-Z0-9_.]+|func\s+[a-zA-Z0-9_]+\s*\()/,
        };

        for (const [language, pattern] of Object.entries(patterns)) {
            if (pattern.test(code)) {
                return language;
            }
        }
        return null;
    }

    // Add input editor change handler
    inputEditor.on('change', function(cm, change) {
        const content = cm.getValue();
        if (content && !$('#input_language').val()) {
            const detectedLang = detectLanguageFromContent(content);
            if (detectedLang) {
                $('#input_language').val(detectedLang);
            }
        }
    });
});


