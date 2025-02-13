import React, { useCallback, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { defaultFeatures } from "@ledgerhq/live-common/featureFlags/index";
import type { FeatureId } from "@ledgerhq/types-live";

import { BaseInput, Text, Flex, SearchInput, Icons } from "@ledgerhq/native-ui";
import { includes, lowerCase, trim } from "lodash";
import { InputRenderLeftContainer } from "@ledgerhq/native-ui/components/Form/Input/BaseInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NavigationScrollView from "../../components/NavigationScrollView";
import FeatureFlagDetails, {
  Divider,
  TagDisabled,
  TagEnabled,
} from "./FeatureFlagDetails";
import Alert from "../../components/Alert";

const addFlagHint = `\
If a feature flag is defined in the targeted Firebase environment \
but it is missing from the list, you can type its name in \
the input field "Add missing flag" above and it will appear in the list.\nType the \
flag name in camelCase without the "feature" prefix.\
`;

export default function DebugFeatureFlags() {
  const { t } = useTranslation();
  const [focusedName, setFocusedName] = useState<string | undefined>();
  const [hiddenFlagName, setHiddenFlagName] = useState("");
  const trimmedHiddenFlagName = trim(hiddenFlagName);
  const [searchInput, setSearchInput] = useState<string>("");

  const featureFlags = useMemo(() => {
    const featureKeys = Object.keys(defaultFeatures);
    if (trimmedHiddenFlagName && !featureKeys.includes(trimmedHiddenFlagName))
      featureKeys.push(trimmedHiddenFlagName);
    return featureKeys;
  }, [trimmedHiddenFlagName]);

  const handleAddHiddenFlag = useCallback(
    value => {
      setHiddenFlagName(trim(value));
      setSearchInput(value);
    },
    [setSearchInput, setHiddenFlagName],
  );

  const handleSearch = useCallback(value => {
    setSearchInput(value);
  }, []);

  const filteredFlags = useMemo(() => {
    return featureFlags
      .sort((a, b) => a[0].localeCompare(b[0]))
      .filter(
        name =>
          !searchInput || includes(lowerCase(name), lowerCase(searchInput)),
      );
  }, [featureFlags, searchInput]);

  const content = useMemo(
    () =>
      filteredFlags.map((flagName, index, arr) => (
        <FeatureFlagDetails
          key={flagName}
          focused={focusedName === flagName}
          flagName={flagName as FeatureId}
          setFocusedName={setFocusedName}
          isLast={index === arr.length - 1}
        />
      )),
    [filteredFlags, focusedName],
  );

  const insets = useSafeAreaInsets();

  return (
    <>
      <NavigationScrollView>
        <Flex p={16}>
          <Text mb={6}>{t("settings.debug.featureFlagsTitle")}</Text>
          <SearchInput
            value={searchInput}
            placeholder="Search flag"
            onChange={handleSearch}
            autoCapitalize="none"
          />
          <Flex mt={3} />
          <BaseInput
            value={undefined}
            renderLeft={() => (
              <InputRenderLeftContainer>
                <Icons.PlusMedium color="neutral.c70" />
              </InputRenderLeftContainer>
            )}
            placeholder="Add missing flag (instructions above)"
            onChange={handleAddHiddenFlag}
            autoCapitalize="none"
          />
          <Flex flexDirection="row" mt={4}>
            <Text>Legend: </Text>
            <TagEnabled mx={2}>enabled flag</TagEnabled>
            <TagDisabled mx={2}>disabled flag</TagDisabled>
          </Flex>
          <Divider />
          {filteredFlags.length === 0 ? (
            <Text>{`No flag matching "${searchInput}"`}</Text>
          ) : null}
          {content}
        </Flex>
      </NavigationScrollView>
      <Flex px={16} mt={3} mb={insets.bottom}>
        <Alert title={addFlagHint} type="hint" />
      </Flex>
    </>
  );
}
