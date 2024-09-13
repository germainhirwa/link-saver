# Link Saver Extension

## Description
Link Saver is a Chrome extension that allows users to save, categorize, and easily access their important links or entertaining reels. With a user-friendly interface, it provides a convenient way to organize and manage your favorite web content.

## Features
- Save links with custom names and categories
- Categorize links (Instagram, Facebook, Twitter, YouTube, or custom categories)
- Search and filter saved links
- Copy links to clipboard
- Update and delete saved links
- Export and import links
- Responsive design with a clean user interface

## Installation
1. Download the extension files or clone the repository.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage
1. Click on the Link Saver icon in your Chrome toolbar to open the popup.
2. To save a link:
   - Paste the URL in the "Paste your link here" field.
   - (Optional) Enter a custom name for the link.
   - Select a category or create a new one.
   - Click "Save Link" to store it.
3. To view saved links, click the "Show Saved Links" button.
4. Use the category filter and search bar to find specific links.
5. Update or delete links using the buttons next to each saved link.
6. Copy links to your clipboard with the "Copy" button.

## Exporting and Importing Links
- To export your saved links, use the "Export Links" button.
- To import links, use the "Import Links" button and select a previously exported JSON file.

## File Structure
- `popup.html`: The main HTML file for the extension's user interface
- `js/popup.js`: JavaScript file containing the extension's functionality
- `css/styles.css`: CSS file for styling the popup
- `manifest.json`: Configuration file for the Chrome extension
- `images/`: Directory containing icon files
- `fontawesome/`: Directory containing Font Awesome files for icons

## Version
Current version: 1.3

## Permissions
This extension requires the following permission:
- `storage`: To save and retrieve links using Chrome's storage API

## Support
If you encounter any issues or have suggestions for improvements, please open an issue in the GitHub repository or contact the developer.

## License

This project is licensed under the MIT License:

MIT License

Copyright (c) [2024] [Germain Hirwa]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Acknowledgements
- Font Awesome for providing icons used in the extension
