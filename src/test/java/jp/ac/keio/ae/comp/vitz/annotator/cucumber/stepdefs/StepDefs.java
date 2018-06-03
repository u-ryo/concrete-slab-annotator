package jp.ac.keio.ae.comp.vitz.annotator.cucumber.stepdefs;

import jp.ac.keio.ae.comp.vitz.annotator.ConcreteSlabAnnotatorApp;

import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.ResultActions;

import org.springframework.boot.test.context.SpringBootTest;

@WebAppConfiguration
@SpringBootTest
@ContextConfiguration(classes = ConcreteSlabAnnotatorApp.class)
public abstract class StepDefs {

    protected ResultActions actions;

}
