package com.circuitculture.portal.catalog;

import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Loads sample products into the in-memory H2 database on startup. */
@Configuration
public class SeedData {

    @Bean
    CommandLineRunner seedProducts(ProductRepository repo) {
        return args -> {
            if (repo.count() > 0) {
                return;
            }

            repo.save(new Product("Circuit Logo Tee",
                    "Soft cotton tee with the Circuit Culture logo printed across the chest.",
                    new BigDecimal("29.99"), "Tops", null)
                    .addVariant("S", "Black", 10).addVariant("M", "Black", 15).addVariant("L", "Black", 8)
                    .addVariant("S", "White", 6).addVariant("M", "White", 12).addVariant("L", "White", 0));

            repo.save(new Product("Voltage Hoodie",
                    "Heavyweight fleece hoodie with a kangaroo pocket and embroidered bolt.",
                    new BigDecimal("59.99"), "Tops", null)
                    .addVariant("M", "Grey", 7).addVariant("L", "Grey", 9).addVariant("XL", "Grey", 4)
                    .addVariant("M", "Navy", 5).addVariant("L", "Navy", 3).addVariant("XL", "Navy", 0));

            repo.save(new Product("Signal Joggers",
                    "Tapered joggers with a drawstring waist and zip pockets.",
                    new BigDecimal("44.99"), "Bottoms", null)
                    .addVariant("S", "Black", 6).addVariant("M", "Black", 10).addVariant("L", "Black", 10)
                    .addVariant("M", "Olive", 4).addVariant("L", "Olive", 2));

            repo.save(new Product("Patchwork Denim Jacket",
                    "Relaxed-fit denim jacket with hand-stitched circuit patches.",
                    new BigDecimal("89.99"), "Outerwear", null)
                    .addVariant("M", "Blue", 3).addVariant("L", "Blue", 5).addVariant("XL", "Blue", 2));

            repo.save(new Product("Culture Cap",
                    "Six-panel cap with an adjustable strap and embroidered logo.",
                    new BigDecimal("24.99"), "Accessories", null)
                    .addVariant("One Size", "Black", 20).addVariant("One Size", "Red", 14));

            repo.save(new Product("Wireframe Tote Bag",
                    "Durable canvas tote with a wireframe graphic print.",
                    new BigDecimal("19.99"), "Accessories", null)
                    .addVariant("One Size", "Natural", 25));
        };
    }
}
