package com.circuitculture.portal.catalog;

import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Loads sample Circuit Culture products into the in-memory H2 database on startup.
 * Collections mirror the Shopify store: Endurance, Design District and Driven By
 * (Miami Mango is coming soon, so it has no products). Garment types are Shirts,
 * Hoodies, Pants and Hats. Prices and stock are placeholders.
 */
@Configuration
public class SeedData {

    @Bean
    CommandLineRunner seedProducts(ProductRepository repo) {
        return args -> {
            if (repo.count() > 0) {
                return;
            }

            repo.save(new Product("Air-Cooled Tee",
                    "Heavyweight tee with our Air-Cooled flat-six print. Made to order.",
                    new BigDecimal("34.00"), "Shirts", "Endurance", "/products/air-cooled.png")
                    .addVariant("S", "Black", 10).addVariant("M", "Black", 15).addVariant("L", "Black", 8)
                    .addVariant("S", "White", 6).addVariant("M", "White", 12).addVariant("L", "White", 0));

            repo.save(new Product("Jesko Hoodie",
                    "Fleece hoodie with the Jesko hypercar graphic across the back.",
                    new BigDecimal("68.00"), "Hoodies", "Endurance", "/products/jesko.png")
                    .addVariant("M", "Black", 7).addVariant("L", "Black", 9).addVariant("XL", "Black", 4)
                    .addVariant("M", "Grey", 5).addVariant("L", "Grey", 3).addVariant("XL", "Grey", 0));

            repo.save(new Product("Endless Sunset Tee",
                    "Sunset print on a soft, garment-dyed tee.",
                    new BigDecimal("34.00"), "Shirts", "Design District", "/products/endless-sunset.png")
                    .addVariant("S", "Black", 6).addVariant("M", "Black", 10).addVariant("L", "Black", 10)
                    .addVariant("M", "White", 4).addVariant("L", "White", 2));

            repo.save(new Product("8-Bit Car Hoodie",
                    "Pixel-art car on a midweight pullover hoodie.",
                    new BigDecimal("64.00"), "Hoodies", "Design District", "/products/8-bit-car.png")
                    .addVariant("M", "Black", 8).addVariant("L", "Black", 5).addVariant("XL", "Black", 3));

            repo.save(new Product("Green Beast Joggers",
                    "Tapered joggers with a Green Beast leg print and zip pockets.",
                    new BigDecimal("58.00"), "Pants", "Design District", "/products/green-beast.png")
                    .addVariant("S", "Black", 5).addVariant("M", "Black", 9).addVariant("L", "Black", 7));

            repo.save(new Product("American Stallion Cap",
                    "Six-panel cap with an embroidered American Stallion.",
                    new BigDecimal("28.00"), "Hats", "Design District", "/products/american-stallion.png")
                    .addVariant("One Size", "Black", 20).addVariant("One Size", "White", 14));

            repo.save(new Product("Green Beast Tee",
                    "A portrait of someone's car, rendered onto a tee. Made to order.",
                    new BigDecimal("34.00"), "Shirts", "Driven By", "/products/green-beast.png")
                    .addVariant("M", "Black", 5).addVariant("L", "Black", 5).addVariant("XL", "Black", 2));

            repo.save(new Product("Pink Beast Tee",
                    "A portrait of someone's car, rendered onto a tee. Made to order.",
                    new BigDecimal("34.00"), "Shirts", "Driven By", "/products/pink-beast.png")
                    .addVariant("S", "Black", 4).addVariant("M", "Black", 6).addVariant("L", "Black", 0));
        };
    }
}
