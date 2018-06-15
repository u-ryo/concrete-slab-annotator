package jp.ac.keio.ae.comp.vitz.annotator.config;

import io.github.jhipster.config.JHipsterProperties;
import org.ehcache.config.builders.CacheConfigurationBuilder;
import org.ehcache.config.builders.ResourcePoolsBuilder;
import org.ehcache.expiry.Duration;
import org.ehcache.expiry.Expirations;
import org.ehcache.jsr107.Eh107Configuration;

import java.util.concurrent.TimeUnit;

import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.*;

@Configuration
@EnableCaching
public class CacheConfiguration {

    private final javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration;

    public CacheConfiguration(JHipsterProperties jHipsterProperties) {
        JHipsterProperties.Cache.Ehcache ehcache =
            jHipsterProperties.getCache().getEhcache();

        jcacheConfiguration = Eh107Configuration.fromEhcacheCacheConfiguration(
            CacheConfigurationBuilder.newCacheConfigurationBuilder(Object.class, Object.class,
                ResourcePoolsBuilder.heap(ehcache.getMaxEntries()))
                .withExpiry(Expirations.timeToLiveExpiration(Duration.of(ehcache.getTimeToLiveSeconds(), TimeUnit.SECONDS)))
                .build());
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer() {
        return cm -> {
            cm.createCache(jp.ac.keio.ae.comp.vitz.annotator.repository.UserRepository.USERS_BY_LOGIN_CACHE, jcacheConfiguration);
            cm.createCache(jp.ac.keio.ae.comp.vitz.annotator.repository.UserRepository.USERS_BY_EMAIL_CACHE, jcacheConfiguration);
            cm.createCache(jp.ac.keio.ae.comp.vitz.annotator.domain.User.class.getName(), jcacheConfiguration);
            cm.createCache(jp.ac.keio.ae.comp.vitz.annotator.domain.Authority.class.getName(), jcacheConfiguration);
            cm.createCache(jp.ac.keio.ae.comp.vitz.annotator.domain.User.class.getName() + ".authorities", jcacheConfiguration);
            cm.createCache(jp.ac.keio.ae.comp.vitz.annotator.domain.SocialUserConnection.class.getName(), jcacheConfiguration);
            cm.createCache(jp.ac.keio.ae.comp.vitz.annotator.domain.Image.class.getName(), jcacheConfiguration);
            cm.createCache(jp.ac.keio.ae.comp.vitz.annotator.domain.Image.class.getName() + ".annotations", jcacheConfiguration);
            cm.createCache(jp.ac.keio.ae.comp.vitz.annotator.domain.Annotation.class.getName(), jcacheConfiguration);
            cm.createCache(jp.ac.keio.ae.comp.vitz.annotator.domain.Annotation.class.getName() + ".rectangles", jcacheConfiguration);
            cm.createCache(jp.ac.keio.ae.comp.vitz.annotator.domain.Rectangle.class.getName(), jcacheConfiguration);
            cm.createCache(jp.ac.keio.ae.comp.vitz.annotator.domain.AccessLog.class.getName(), jcacheConfiguration);
            // jhipster-needle-ehcache-add-entry
        };
    }
}
