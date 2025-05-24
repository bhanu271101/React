import React, { useState, useEffect } from "react";
import { Card, CardMedia, CardContent, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const User = import.meta.env.VITE_USER;
  const Product = import.meta.env.VITE_PRODUCT;
  const Orders = import.meta.env.VITE_ORDERS;

  useEffect(() => {
    const fetchProductsAndImages = async () => {
      try {
        setLoading(true);

        const productsResponse = await axios.get(`${Product}/product/getAllProducts`);
        const shuffledProducts = productsResponse.data.sort(() => 0.5 - Math.random()).slice(0, 5);
        setProducts(shuffledProducts);

        const mobileIds = shuffledProducts.map(product => product.mobileId);
        const query = mobileIds.map(id => `mobileId=${id}`).join('&');

        const imagesResponse = await axios.get(`${Product}/imagesByIds?${query}`);
        if (imagesResponse.data) {
          const images = imagesResponse.data.reduce((acc, image) => {
            acc[image.id] = image.image;
            return acc;
          }, {});
          setImagesMap(images);
        }
      } catch (error) {
        console.error("Error fetching products or images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndImages();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        (prevIndex + 1) % products.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [products]);

  const handleViewDetails = (mobileId) => {
    const image = imagesMap[mobileId]
      ? `data:image/jpeg;base64,${imagesMap[mobileId]}`
      : 'https://via.placeholder.com/400x300?text=No+Image';
    navigate(`/product/${mobileId}`, { state: { image } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <CircularProgress />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <Typography variant="h6">No products available</Typography>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-gray-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-100 opacity-20 mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-100 opacity-20 mix-blend-multiply filter blur-xl animate-float-delay"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDdiZmYiIG9wYWNpdHk9IjAuMSI+PHBhdGggZD0iTTM2IDM0aDV2NUgzNnptLTI1IDVoNVYzNGgtNXptMjUtMTVoNVYzNEgzNnptLTI1IDVoNVYxOWgtNXptMTUtMTVoNVYxOUgyMXptLTI1IDVoNVYxOUgxNnptMTUtMTVoNVY0SDMxem0tMjUgNWg1VjRIMXoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-2xl mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            Discover the Latest Mobiles at <span className="text-blue-600">MobileStore</span>
          </h1>
          <p className="text-lg text-gray-600">
            Find great deals on brand new smartphones, all in one place.
          </p>
        </div>

        {/* Product Display Card with subtle shadow and glow */}
        <div className="w-full max-w-md transition-all duration-500 hover:scale-[1.02] cursor-pointer" aria-label={`View details of ${currentProduct.mobileName}`}>
          <Card
            sx={{
              maxWidth: 400,
              margin: '0 auto',
              borderRadius: '12px',
              boxShadow: '0 10px 30px -5px rgba(0, 119, 255, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 15px 35px -5px rgba(0, 119, 255, 0.25)',
              },
              opacity: 1,
              animation: 'fadeIn 0.8s ease-in-out',
            }}
            onClick={() => handleViewDetails(currentProduct.mobileId)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if (e.key === 'Enter') handleViewDetails(currentProduct.mobileId); }}
          >
            <CardMedia
              component="img"
              height="300"
              image={imagesMap[currentProduct.mobileId]
                ? `data:image/jpeg;base64,${imagesMap[currentProduct.mobileId]}`
                : 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={currentProduct.mobileName}
              sx={{
                objectFit: 'contain',
                padding: 2,
                background: 'radial-gradient(circle, rgba(240,242,255,1) 0%, rgba(255,255,255,1) 100%)',
              }}
            />
            <CardContent sx={{ background: 'rgba(255, 255, 255, 0.85)' }}>
              <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentProduct.mobileName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxHeight: 48, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentProduct.description}
              </Typography>
              <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, color: '#0077ff' }}>
                ₹{currentProduct.price}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  background: 'linear-gradient(to right, #0077ff, #00a1ff)',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  '&:hover': {
                    background: 'linear-gradient(to right, #0066dd, #0088ee)',
                  },
                }}
                onClick={() => handleViewDetails(currentProduct.mobileId)}
                aria-label={`View details of ${currentProduct.mobileName}`}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progress indicators with animation */}
        <div className="flex justify-center mt-6 gap-3" aria-label="Product carousel indicators">
          {products.map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-300 shadow-md ${
                index === currentIndex ? 'bg-blue-600 scale-125 shadow-blue-500' : 'bg-gray-300'
              }`}
              aria-current={index === currentIndex ? 'true' : 'false'}
              role="button"
              tabIndex={0}
              onClick={() => setCurrentIndex(index)}
              onKeyPress={(e) => { if (e.key === 'Enter') setCurrentIndex(index); }}
              aria-label={`Go to product ${index + 1}`}
            />
          ))}
        </div>
      </main>

      {/* Footer with subtle border */}
      <footer className="p-4 text-center text-gray-600 bg-white/80 backdrop-blur-sm border-t border-gray-100 relative z-10">
        <p>&copy; 2025 MobileStore. All rights reserved.</p>
      </footer>

      {/* Add CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float 10s ease-in-out infinite 2s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
