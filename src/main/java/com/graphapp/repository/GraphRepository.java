package com.graphapp.repository;

import com.graphapp.domain.Graph;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Graph entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GraphRepository extends JpaRepository<Graph, Long> {}
