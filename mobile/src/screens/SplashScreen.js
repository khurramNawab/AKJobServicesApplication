import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <title>AK Job Services | Premium Animated Logo</title>
    <!-- Professional Font (Poppins) & smooth base style -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(145deg, #f1f5f9 0%, #e6edf4 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
            padding: 2rem;
            margin: 0;
            overflow: hidden; /* prevent scrollbars */
        }

        /* Logo card container — gives elegant presence */
        .logo-card {
            background: #ffffff;
            border-radius: 2rem;
            box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.05);
            padding: 1.2rem 1.5rem 1rem 1.5rem;
            transition: box-shadow 0.3s ease;
            backdrop-filter: blur(0px);
        }

        .logo-card:hover {
            box-shadow: 0 30px 55px -15px rgba(37, 99, 235, 0.2);
        }

        /* SVG responsive & smooth rendering */
        svg {
            display: block;
            width: 100%;
            height: auto;
            max-width: 380px;
            margin: 0 auto;
            filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.05));
            transition: filter 0.2s;
        }

        /* reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
            .animated-chevron {
                animation: none !important;
            }
        }

        /* ========= JOB PROFILE SUITED ANIMATION ========= */
        /* Subtle stroke pulse on the chevron symbol → represents 
           forward momentum, career progression, active job matching. */
        @keyframes careerPulse {
            0% {
                stroke-width: 10;
                stroke-opacity: 1;
                filter: drop-shadow(0 0 0px rgba(37, 99, 235, 0));
            }
            45% {
                stroke-width: 12.2;
                stroke-opacity: 0.85;
                filter: drop-shadow(0 0 4px rgba(79, 70, 229, 0.4));
            }
            70% {
                stroke-width: 11;
                stroke-opacity: 0.95;
            }
            100% {
                stroke-width: 10;
                stroke-opacity: 1;
                filter: drop-shadow(0 0 0px rgba(37, 99, 235, 0));
            }
        }

        /* Gentle "breathing" animation for the tagline — highlights job services */
        @keyframes softBreathing {
            0% {
                opacity: 0.78;
                letter-spacing: 3px;
            }
            50% {
                opacity: 1;
                letter-spacing: 3.6px;
            }
            100% {
                opacity: 0.78;
                letter-spacing: 3px;
            }
        }

        .tagline-animate {
            animation: softBreathing 2.4s ease-in-out infinite;
            transform-origin: center;
        }

        /* Hover refinement: keep animations alive, but adds polish */
        .animated-chevron {
             animation: careerPulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        svg:hover .animated-chevron {
            animation-play-state: running;
        }
        svg:hover .tagline-animate {
            animation-play-state: running;
        }
    </style>
</head>
<body>
<div class="logo-card">
    <svg width="360" height="200" viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg" style="border-radius: 24px;">
        <defs>
            <!-- Balanced Premium Gradient (Blue Focus → Elegant Pink accent) -->
            <linearGradient id="luxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#2563EB"/>
                <stop offset="60%" stop-color="#4F46E5"/>
                <stop offset="100%" stop-color="#EC4899"/>
            </linearGradient>
            <!-- Soft Glow Filter (enhances depth and professionalism) -->
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2.2"/>
                <feMerge>
                    <feMergeNode in="offsetblur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
                <feGaussianBlur stdDeviation="1.8" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        <!-- CENTERED GROUP with elegant glow -->
        <g transform="translate(100,20)" filter="url(#softGlow)">
            <!-- A letter (main triangular shape) – strength & stability -->
            <path d="M40 120 L70 40 L100 120 Z" fill="url(#luxGrad)" stroke="none" stroke-width="0"/>
            <!-- A Inner Cut (modern minimalist style) -->
            <path d="M58 105 L70 75 L82 105 Z" fill="#ffffff" stroke="none" stroke-width="0"/>
            <!-- 
                CHEVRON symbol "<" 
            -->
            <path class="animated-chevron" id="chevronPath" d="M110 75 L80 100 L110 125" 
                  stroke="url(#luxGrad)" 
                  stroke-width="10" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  fill="none"
                  stroke-opacity="1"/>
        </g>
        
        <text x="50%" y="158" text-anchor="middle" font-size="13" 
              fill="#4B5563" font-family="Poppins, Arial, sans-serif" 
              letter-spacing="3" class="tagline-animate"> job services </text>
        
        <!-- optional micro detail: subtle decorative dot (adds polish, no distraction) -->
        <circle cx="50%" cy="184" r="1.5" fill="#4F46E5" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
    </svg>
</div>
</body>
</html>
`;

const SplashScreenVisual = () => {
    return (
        <View style={styles.container}>
            <WebView 
                originWhitelist={['*']}
                source={{ html: HTML_CONTENT }}
                style={styles.webview}
                scrollEnabled={false}
                bounces={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    webview: {
        flex: 1,
        width: width,
        height: height,
        backgroundColor: 'transparent',
    }
});

export default SplashScreenVisual;
