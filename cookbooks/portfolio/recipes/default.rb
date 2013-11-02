node.set[:mongodb][:package_name] = 'mongodb'

include_recipe "apt"
include_recipe "build-essential"
include_recipe "nodejs::install_from_package"
include_recipe "nodejs::npm"
include_recipe "mongodb::default"
include_recipe "git"

user "vagrant" do
	comment "Vagrant User"
	uid 1000
	gid "users"
	home "/home/vagrant"
	shell "/bin/bash"
end

directory "/vagrant" do
	owner "vagrant"
	group "vagrant"
	mode 00755
	action :create
end

bash "install express and start server" do
	cwd "/vagrant"
	user "root"
	code <<-EOF
		sudo npm install
	EOF
end

bash "install node supervisor" do
	cwd "/vagrant"
	user "root"
	code <<-EOF
		npm install supervisor -g
	EOF
end

cookbook_file "/home/vagrant/.profile" do
	source ".profile"
	backup false
	owner "vagrant"
	group "vagrant"
	action :create
end