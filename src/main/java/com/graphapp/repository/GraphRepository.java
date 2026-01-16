package com.graphapp.repository;

import com.graphapp.domain.Graph;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Graph entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GraphRepository extends JpaRepository<Graph, Long> {
    Optional<Graph> findOneByName(String name);
}
