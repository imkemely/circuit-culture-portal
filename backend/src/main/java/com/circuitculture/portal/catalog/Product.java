package com.circuitculture.portal.catalog;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(length = 1000)
    private String description;

    private BigDecimal price;
    private String category;

    /** Design collection: Endurance, Design District, Driven By (Miami Mango has none yet). */
    private String collection;

    /** Optional image path/URL. The frontend shows a placeholder when empty. */
    private String imageUrl;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private List<ProductVariant> variants = new ArrayList<>();

    protected Product() {
    }

    public Product(String name, String description, BigDecimal price, String category,
                   String collection, String imageUrl) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.collection = collection;
        this.imageUrl = imageUrl;
    }

    public Product addVariant(String size, String color, int stock) {
        variants.add(new ProductVariant(size, color, stock));
        return this;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public String getCategory() { return category; }
    public String getCollection() { return collection; }
    public String getImageUrl() { return imageUrl; }
    public List<ProductVariant> getVariants() { return variants; }
}
