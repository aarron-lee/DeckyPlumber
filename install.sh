#!/usr/bin/bash
# does the following:
# - controller config via DeckyPlumber Decky Plugin
VERSION=${VERSION_TAG:-"LATEST"}

if [ "$EUID" -eq 0 ]
  then echo "Please do not run as root"
  exit
fi

echo "removing previous install if it exists"

cd $HOME

sudo rm -rf $HOME/homebrew/plugins/DeckyPlumber

echo "installing DeckyPlumber plugin for control configs"

FINAL_URL='https://api.github.com/repos/aarron-lee/DeckyPlumber/releases/latest'
if [ $VERSION != "LATEST" ] ; then
  FINAL_URL="https://api.github.com/repos/aarron-lee/DeckyPlumber/releases/tags/${VERSION}"
fi

# download + install plugin
curl -L $(curl -s $FINAL_URL | grep "browser_download_url" | cut -d '"' -f 4) -o $HOME/DeckyPlumber.tar.gz
sudo tar -xzf DeckyPlumber.tar.gz -C $HOME/homebrew/plugins

# install complete, remove build dir
rm  $HOME/DeckyPlumber.tar.gz
sudo systemctl restart plugin_loader.service
echo "Installation complete"
