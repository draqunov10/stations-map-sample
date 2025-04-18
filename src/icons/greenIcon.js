import L from 'leaflet';

const greenIcon = new L.Icon({
  iconUrl: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.pngkey.com%2Fpng%2Ffull%2F123-1232336_gps-download-png-image-green-location-png-icon.png', // Replace with the actual URL or path to your green marker icon
  iconSize: [30, 40],
  iconAnchor: [15, 50],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

export default greenIcon;