// Import local images from your assets folder
const marrakech = require('../assets/images/marrakech.jpg');
const fes = require('../assets/images/fes.jpg');
const chefchaouen = require('../assets/images/chefchaouen.jpg');
const casablanca = require('../assets/images/casablanca.jpg');
const rabat = require('../assets/images/rabat.jpg');
const tanger = require('../assets/images/tanger.jpg');

// Map image names to local images
const cityImageMap: Record<string, any> = {
  'marrakech.jpg': marrakech,
  'marrakech': marrakech,
  'fes.jpg': fes,
  'fes': fes,
  'chefchaouen.jpg': chefchaouen,
  'chefchaouen': chefchaouen,
  'casablanca.jpg': casablanca,
  'casablanca': casablanca,
  'rabat.jpg': rabat,
  'rabat': rabat,
  'tanger.jpg': tanger,
  'tanger': tanger,
};

export const getCityImage = (imageName: string) => {
  
  if (!imageName) return marrakech;
  
  // Try to find the image
  const localImage = cityImageMap[imageName];
  if (localImage) {
    return localImage;
  }
  
  // Try without extension
  const nameWithoutExt = imageName.replace('.jpg', '');
  const fallbackImage = cityImageMap[nameWithoutExt];
  if (fallbackImage) {
    return fallbackImage;
  }
  
  // Default to marrakech
  console.log('Image not found, using default:', imageName);
  return marrakech;
};

export default getCityImage;