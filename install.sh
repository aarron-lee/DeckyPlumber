#!/usr/bin/bash
# does the following:
# - controller config via DeckyPlumber Decky Plugin
if [ "$EUID" -eq 0 ]
  then echo "Please do not run as root"
  exit
fi

echo "removing previous install if it exists"

cd $HOME

sudo rm -rf $HOME/homebrew/plugins/DeckyPlumber

echo "installing DeckyPlumber plugin for control configs"
# download + install plugin
curl -L $(curl -s https://api.github.com/repos/aarron-lee/DeckyPlumber/releases/latest | grep "browser_download_url" | cut -d '"' -f 4) -o $HOME/DeckyPlumber.tar.gz
sudo tar -xzf DeckyPlumber.tar.gz -C $HOME/homebrew/plugins

# install complete, remove build dir
rm  $HOME/DeckyPlumber.tar.gz
sudo systemctl restart plugin_loader.service
echo "Installation complete"
