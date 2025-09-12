# AI Online Doctor 🩺

A modern, AI-powered medical assistance webapp that helps provide initial diagnosis and medical guidance. Designed to serve both healthcare professionals in less developed countries and everyday people seeking preliminary medical advice.

## 🌟 Features

### Interactive Body Diagram
- Click on different body areas to specify where symptoms occur
- Visual SVG-based human body diagram
- Intuitive area selection with hover effects and animations

### Comprehensive Symptom Input
- Pre-defined symptom tags for each body area
- Custom symptom description text area
- **Photo upload capability** for visual symptoms and conditions
- Pain/discomfort severity scale (1-10)
- Smart symptom categorization

### AI-Powered Consultation
- Integration with Groq's Llama 3.3 70B model for enhanced medical guidance
- **Multimodal support**: Upload photos to accompany your messages for visual analysis
- Contextual medical guidance and recommendations
- Interactive chat interface for follow-up questions
- Professional medical advice with proper disclaimers and content safety

### Modern UI/UX
- **Automatic onboarding**: Prompts for API key setup on first visit
- Beautiful gradient backgrounds and smooth animations
- Responsive design for mobile and desktop
- Clean, medical-themed color scheme
- Intuitive user flow from body selection → symptoms → AI chat
- **Persistent API key management** with visual status indicators

## 🚀 Getting Started

### Prerequisites
- Web browser with modern JavaScript support
- Groq API key (free at [console.groq.com](https://console.groq.com/))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd online-doctor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:8080`

### Groq API Setup

1. Visit [Groq Console](https://console.groq.com/)
2. Create a free account
3. Generate an API key
4. **The app will automatically prompt you** to enter your API key when you first visit
5. Enter your key in the bottom-left API status panel
6. The key will be securely stored in your browser's local storage
7. **Option to start diagnosis immediately** after successful setup

## 📱 How to Use

### Step 1: Body Area Selection
1. Click "Start Diagnosis" on the welcome screen
2. Select the body area where you're experiencing symptoms
3. Click "Continue to Symptoms"

### Step 2: Symptom Input
1. Select relevant symptoms from the pre-defined tags
2. Add additional details in the description box
3. **Upload photos** of visible symptoms, rashes, injuries, or conditions
4. Set your pain/discomfort level on the scale
5. Click "Start AI Consultation"

### Step 3: AI Consultation
1. The AI will provide an initial analysis
2. Continue the conversation by asking questions
3. **Upload photos** using the camera icon for visual analysis
4. Get personalized medical guidance and recommendations
5. Use "New Diagnosis" to start over

## 🏥 Medical Disclaimer

**IMPORTANT**: This application is for educational and informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## 🛠️ Technical Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **AI Integration**: Groq API with LLaMA 3.3 70B model
- **Styling**: CSS Custom Properties, Flexbox, Grid
- **Icons**: Font Awesome 6
- **Fonts**: Inter from Google Fonts
- **Server**: http-server for development

## 🎨 Design Features

### Color Scheme
- Primary: Medical blue (#2563eb)
- Secondary: Healing green (#10b981)
- Accent: Attention amber (#f59e0b)
- Neutral grays for text and backgrounds

### Animations
- Smooth hover transitions
- Pulsing effect for selected body areas
- Loading spinners for AI responses
- Slide-in notifications

### Responsive Design
- Mobile-first approach
- Flexible layouts that adapt to screen size
- Touch-friendly interactive elements

## 🔧 Configuration

### Environment Variables
The app uses client-side storage for the API key. No server-side environment variables needed.

### API Configuration
- Model: `llama-3.3-70b-versatile`
- Max tokens: 1000
- Temperature: 0.7 (balanced creativity and consistency)
- Enhanced medical guidance with latest Llama 3.3 model
- **Multimodal support**: Accepts both text and image inputs

## 📄 File Structure

```
online-doctor/
├── public/
│   ├── index.html      # Main HTML structure
│   ├── styles.css      # All styling and animations
│   └── script.js       # Application logic and API integration
├── package.json        # Project configuration and scripts
└── README.md          # This file
```

## 🚀 Deployment

The application is fully client-side and can be deployed to any static hosting service:

1. **Netlify**: Drag and drop the `public` folder
2. **Vercel**: Connect your Git repository
3. **GitHub Pages**: Push to a GitHub repo and enable Pages
4. **Firebase Hosting**: Use Firebase CLI to deploy

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Groq for providing fast AI inference with Llama 3.3 70B
- Font Awesome for medical icons
- Google Fonts for the Inter typeface
- The open-source community for inspiration

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page for existing problems
2. Create a new issue with detailed information
3. Ensure your Groq API key is valid and has remaining credits

---

**Made with ❤️ for better healthcare accessibility** 