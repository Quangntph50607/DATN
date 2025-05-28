import MainHome from "@/components/layout/(components)/MainHome";
import MainLayout from "@/components/layout/layout";
import React from "react";

export default function HomePage() {
  const featuredProducts = [
    {
      id: 1,
      image: "/images/featured1.jpg",
      title: "LEGO Death Star",
      category: "Tàu Vũ Trụ",
      price: "$199.99",
      description: "A detailed replica of the iconic Death Star.",
    },
    {
      id: 2,
      image: "/images/featured2.jpg",
      title: "LEGO Technic Bugatti Chiron",
      category: "Xe Tank",
      price: "$349.99",
      description: "A high-tech car model with working features.",
    },
  ];

  const listTitle = [
    {
      id: 3,
      image: "/images/ship1.jpg",
      title: "LEGO Battleship",
      category: "Tàu Chiến",
    },
    {
      id: 4,
      image: "/images/ship2.jpg",
      title: "LEGO Luxury Yacht",
      category: "Du Thuyền",
    },
    {
      id: 5,
      image: "/images/ship3.jpg",
      title: "LEGO Aircraft Carrier",
      category: "Tàu Sân Bay",
    },
    {
      id: 6,
      image: "/images/robot1.jpg",
      title: "LEGO Battle Robot",
      category: "Robot",
    },
    {
      id: 7,
      image: "/images/tank1.jpg",
      title: "LEGO Tank",
      category: "Xe Tank",
    },
    {
      id: 8,
      image: "/images/spaceship1.jpg",
      title: "LEGO Space Shuttle",
      category: "Tàu Vũ Trụ",
    },
    {
      id: 9,
      image: "/images/building1.jpg",
      title: "LEGO Eiffel Tower",
      category: "Kiến Trúc",
    },
    {
      id: 10,
      image: "/images/building2.jpg",
      title: "LEGO City Skyline",
      category: "Building",
    },
  ];

  return (
    <MainLayout>
      <MainHome
        listTitle={listTitle}
        featuredProducts={featuredProducts}
        title="Explore LEGO Sets"
      />
    </MainLayout>
  );
}
