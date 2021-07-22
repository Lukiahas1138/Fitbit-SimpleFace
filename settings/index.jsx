function clockSettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Clockface Settings</Text>}>
        <Toggle
          settingsKey="euww"
          label="UTC (vs US) WW"
        />
        <ColorSelect
          settingsKey="color"
          colors={[
            {color: "tomato"},
            {color: "orange"},
            {color: "yellow"},
            {color: "green"},
            {color: "deepskyblue"},
            {color: "plum"},
            {color: "white"},
            {color: "gray"}
          ]}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(clockSettings);