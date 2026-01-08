// Custom Dictionary Utility
// Manages word-to-image mappings in localStorage

// Predefined word-image mappings (code-based)
const PREDEFINED_IMAGES = {
  birds: "/images/bird.png",
  bird: "/images/bird.png",
  friends: "/images/friends.png",
  friend: "/images/friends.png",
  animals: "/images/animals.png",
  deer: "/images/deer.png",
  elephant: "/images/elephant.png",
  giraffe: "/images/giraffe.png",
  grass: "/images/grass.png",
  leaves: "/images/leaves.png",
  rain: "/images/rain.png"
};


const DICTIONARY_KEY = 'dyslexiaid_custom_dictionary';

// Initialize dictionary structure if it doesn't exist
const initializeDictionary = () => {
  const existing = localStorage.getItem(DICTIONARY_KEY);
  if (!existing) {
    const initialDict = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      words: {}
    };
    localStorage.setItem(DICTIONARY_KEY, JSON.stringify(initialDict));
  }
};

// Get custom image for a word (returns base64 string or null)
export const getCustomImage = (word) => {
  try {
    if (!word) return null;

    const normalizedWord = word.toLowerCase().trim();

    // 1️⃣ Check predefined code-based images
    if (PREDEFINED_IMAGES[normalizedWord]) {
      return PREDEFINED_IMAGES[normalizedWord];
    }

    // 2️⃣ Fallback to localStorage dictionary
    initializeDictionary();
    const dictionary = JSON.parse(localStorage.getItem(DICTIONARY_KEY) || '{"words":{}}');
    return dictionary.words[normalizedWord]?.imageData || null;
  } catch (error) {
    console.error('Error reading custom dictionary:', error);
    return null;
  }
};


// Save a custom word with its image (imageData can be null for placeholder)
export const saveCustomWord = (word, imageData = null) => {
  try {
    initializeDictionary();
    const dictionary = JSON.parse(localStorage.getItem(DICTIONARY_KEY) || '{"version":"1.0","words":{}}');
    const normalizedWord = word.toLowerCase().trim();

    if (!normalizedWord) {
      throw new Error('Word cannot be empty');
    }

    // Allow null imageData for words added without images
    if (imageData && !imageData.startsWith('data:image/')) {
      throw new Error('Invalid image data format');
    }

    dictionary.words[normalizedWord] = {
      imageData: imageData || null,
      source: 'custom',
      dateAdded: dictionary.words[normalizedWord]?.dateAdded || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    dictionary.lastUpdated = new Date().toISOString();

    localStorage.setItem(DICTIONARY_KEY, JSON.stringify(dictionary));
    return { success: true };
  } catch (error) {
    console.error('Error saving to custom dictionary:', error);
    return { success: false, error: error.message };
  }
};

// Delete a custom word
export const deleteCustomWord = (word) => {
  try {
    initializeDictionary();
    const dictionary = JSON.parse(localStorage.getItem(DICTIONARY_KEY) || '{"words":{}}');
    const normalizedWord = word.toLowerCase().trim();

    if (dictionary.words[normalizedWord]) {
      delete dictionary.words[normalizedWord];
      dictionary.lastUpdated = new Date().toISOString();
      localStorage.setItem(DICTIONARY_KEY, JSON.stringify(dictionary));
      return { success: true };
    }

    return { success: false, error: 'Word not found' };
  } catch (error) {
    console.error('Error deleting from custom dictionary:', error);
    return { success: false, error: error.message };
  }
};

// Get all custom words
export const getAllCustomWords = () => {
  try {
    initializeDictionary();
    const dictionary = JSON.parse(localStorage.getItem(DICTIONARY_KEY) || '{"words":{}}');
    return dictionary.words;
  } catch (error) {
    console.error('Error reading custom dictionary:', error);
    return {};
  }
};

// Get dictionary statistics
export const getDictionaryStats = () => {
  try {
    initializeDictionary();
    const dictionary = JSON.parse(localStorage.getItem(DICTIONARY_KEY) || '{"words":{}}');
    const wordCount = Object.keys(dictionary.words).length;
    const estimatedSize = new Blob([localStorage.getItem(DICTIONARY_KEY)]).size;

    return {
      wordCount,
      estimatedSize,
      estimatedSizeKB: Math.round(estimatedSize / 1024),
      lastUpdated: dictionary.lastUpdated
    };
  } catch (error) {
    console.error('Error getting dictionary stats:', error);
    return { wordCount: 0, estimatedSize: 0, estimatedSizeKB: 0 };
  }
};

// Export dictionary as JSON file
export const exportDictionary = () => {
  try {
    initializeDictionary();
    const dictionary = localStorage.getItem(DICTIONARY_KEY) || '{"words":{}}';
    const blob = new Blob([dictionary], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dyslexiaid-dictionary-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Error exporting dictionary:', error);
    return { success: false, error: error.message };
  }
};

// Import dictionary from JSON string
export const importDictionary = (jsonString, mode = 'merge') => {
  try {
    const imported = JSON.parse(jsonString);

    // Validate structure
    if (!imported.words || typeof imported.words !== 'object') {
      throw new Error('Invalid dictionary format');
    }

    if (mode === 'replace') {
      // Replace entire dictionary
      localStorage.setItem(DICTIONARY_KEY, jsonString);
    } else {
      // Merge with existing
      initializeDictionary();
      const existing = JSON.parse(localStorage.getItem(DICTIONARY_KEY));
      const merged = {
        ...existing,
        words: {
          ...existing.words,
          ...imported.words
        },
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(DICTIONARY_KEY, JSON.stringify(merged));
    }

    return { success: true };
  } catch (error) {
    console.error('Error importing dictionary:', error);
    return { success: false, error: error.message };
  }
};

// Clear entire dictionary
export const clearDictionary = () => {
  try {
    localStorage.removeItem(DICTIONARY_KEY);
    initializeDictionary();
    return { success: true };
  } catch (error) {
    console.error('Error clearing dictionary:', error);
    return { success: false, error: error.message };
  }
};

// Convert image file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.match('image/(jpeg|jpg|png|webp|gif)')) {
      reject(new Error('Invalid file type. Please select JPEG, PNG, WebP, or GIF'));
      return;
    }

    // Validate file size (max 200KB for localStorage efficiency)
    if (file.size > 200 * 1024) {
      reject(new Error('Image too large. Please select an image under 200KB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Convert image URL to base64 (with CORS support)
export const urlToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const blob = await response.blob();

    // Check size
    if (blob.size > 200 * 1024) {
      throw new Error('Image too large. Please use an image under 200KB');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to convert image'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting URL to base64:', error);
    throw error;
  }
};
