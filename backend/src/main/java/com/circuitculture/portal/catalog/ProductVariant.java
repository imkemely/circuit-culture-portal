package com.circuitculture.portal.catalog;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

/** One purchasable size/color combination of a product, with its own stock count. */
@Entity
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String size;
    private String color;
    private int stock;

    protected ProductVariant() {
    }

    public ProductVariant(String size, String color, int stock) {
        this.size = size;
        this.color = color;
        this.stock = stock;
    }

    public Long getId() { return id; }
    public String getSize() { return size; }
    public String getColor() { return color; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
}
