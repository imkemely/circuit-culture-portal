package com.circuitculture.portal.stock;

import com.circuitculture.portal.catalog.ProductVariant;   // Arnold's entity (catalog/ProductVariant.java)
import jakarta.persistence.LockModeType;             // Spring Boot 2.x? change "jakarta" to "javax"
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Separate from Arnold's repository on purpose, so our branches never touch the same file.
 * PESSIMISTIC_WRITE makes the database lock the row (SELECT ... FOR UPDATE) until the
 * surrounding transaction ends, so two customers can't both buy the last unit.
 */
public interface VariantLockRepository extends JpaRepository<ProductVariant, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from ProductVariant v where v.id = :id")
    Optional<ProductVariant> findByIdForUpdate(@Param("id") Long id);
}
