package com.graphapp.repository;

import com.graphapp.domain.Edge;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Edge entity.
 */
@SuppressWarnings("unused")
@Repository
public interface EdgeRepository extends JpaRepository<Edge, Long> {}
