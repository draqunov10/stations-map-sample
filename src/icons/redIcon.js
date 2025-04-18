import L from 'leaflet';

const redIcon = new L.Icon({
  iconUrl: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fclipground.com%2Fimages%2Fclipart-map-pin-2.png', // Replace with the actual URL or path to your red marker icon
  iconSize: [30, 40],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

export default redIcon;